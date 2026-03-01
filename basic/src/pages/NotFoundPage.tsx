import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="text-6xl">🌸</div>
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-500">Cette page n'existe pas.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
      >
        Retour à l'accueil
      </button>
    </div>
  );
};
