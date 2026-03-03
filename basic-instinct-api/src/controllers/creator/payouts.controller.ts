import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { getQueryNumber } from '../../lib/query';

export const creatorPayoutsController = {
  // PUT /api/creator/profile/payout-settings - Configuration des infos de paiement
  async updatePayoutSettings(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const {
      preferredPayoutMethod,
      cryptoAddress,
      cryptoNetwork,
      paxfulUsername,
      iban,
    } = req.body;

    const creatorId = req.user.userId;

    // Validation basique
    if (preferredPayoutMethod && !['BANK', 'CRYPTO', 'PAXFUL'].includes(preferredPayoutMethod)) {
      return res.status(400).json({ error: 'Méthode de paiement invalide' });
    }

    // Mise à jour
    const updatedUser = await prisma.user.update({
      where: { id: creatorId },
      data: {
        ...(preferredPayoutMethod !== undefined && { preferredPayoutMethod }),
        ...(cryptoAddress !== undefined && { cryptoAddress }),
        ...(cryptoNetwork !== undefined && { cryptoNetwork }),
        ...(paxfulUsername !== undefined && { paxfulUsername }),
        // Si l'IBAN change, il repasse en non vérifié
        ...(iban !== undefined && { iban, ibanVerified: false }),
      },
      select: {
        preferredPayoutMethod: true,
        cryptoAddress: true,
        cryptoNetwork: true,
        paxfulUsername: true,
        iban: true,
        ibanVerified: true,
      },
    });

    res.json({ success: true, settings: updatedUser });
  },

  // POST /api/creator/payouts/request - Demande de retrait
  async requestPayout(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const creatorId = req.user.userId;
    const { amountCoins } = req.body;
    
    // Le seuil minimum de pièces pour retrait. (Ex: 5000 pièces = 50€)
    const MINIMUM_WITHDRAWAL_COINS = 5000;

    if (!amountCoins || amountCoins < MINIMUM_WITHDRAWAL_COINS) {
      return res.status(400).json({ 
        error: `Le montant minimum de retrait est de ${MINIMUM_WITHDRAWAL_COINS} pièces.` 
      });
    }

    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
    });

    if (!creator) {
      return res.status(404).json({ error: 'Créateur non trouvé' });
    }

    // Vérifier si le solde est suffisant
    if (creator.coinBalance < amountCoins) {
      return res.status(400).json({
        error: 'Solde insuffisant',
        required: amountCoins,
        available: creator.coinBalance,
      });
    }

    // Déterminer la méthode de paiement à utiliser pour CE retrait
    const payoutMethod = creator.preferredPayoutMethod;
    if (!payoutMethod) {
      return res.status(400).json({ 
        error: "Veuillez d'abord configurer une méthode de paiement préférée dans vos paramètres."
      });
    }

    // Construire le snapshot des infos de paiement pour les logs/historique
    let payoutDetails = '';
    if (payoutMethod === 'BANK') {
      if (!creator.ibanVerified) {
        return res.status(400).json({ error: "Votre IBAN doit être vérifié avant de demander un retrait bancaire." });
      }
      payoutDetails = `IBAN: ${creator.iban}`;
    } else if (payoutMethod === 'CRYPTO') {
      if (!creator.cryptoAddress || !creator.cryptoNetwork) {
        return res.status(400).json({ error: "Veuillez fournir une adresse crypto et un réseau valides." });
      }
      payoutDetails = `${creator.cryptoNetwork}: ${creator.cryptoAddress}`;
    } else if (payoutMethod === 'PAXFUL') {
      if (!creator.paxfulUsername) {
        return res.status(400).json({ error: "Veuillez fournir un nom d'utilisateur Paxful." });
      }
      payoutDetails = `Paxful Username: ${creator.paxfulUsername}`;
    }

    // Conversion indicative (1 pièce = 0.01€) pour l'historique et commission
    const amountEur = amountCoins * 0.01;
    // Ex: on peut appliquer des frais bancaires / crypto (fixe ou %, ici 0€ pour test)
    const commissionEur = 0; 
    const netEur = amountEur - commissionEur;

    // Créer la demande de retrait (Les pièces ne sont déduites que lorsque l'admin valide)
    const withdrawal = await prisma.withdrawal.create({
      data: {
        creatorId,
        amountCoins,
        amountEur, // Indicateur historique
        commissionEur,
        netEur,
        payoutMethod,
        payoutDetails,
        status: 'pending',
      }
    });

    res.status(201).json({
      success: true,
      message: 'Demande de retrait envoyée. Elle sera traitée sous peu.',
      withdrawal,
    });
  },

  // GET /api/creator/payouts/history - Historique
  async getPayoutHistory(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const creatorId = req.user.userId;
    const limit = getQueryNumber(req.query.limit, 20);
    const offset = getQueryNumber(req.query.offset, 0);

    const withdrawals = await prisma.withdrawal.findMany({
      where: { creatorId },
      orderBy: { requestedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.withdrawal.count({ where: { creatorId } });

    res.json({
      withdrawals,
      total,
      hasMore: offset + withdrawals.length < total,
    });
  }
};
