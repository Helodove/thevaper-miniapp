import { ShoppingBag } from 'lucide-react';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

export function EmptyCart() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <ShoppingBag
        size={96}
        strokeWidth={1.5}
        style={{ color: 'var(--brand-primary)', opacity: 0.4 }}
      />
      <div className="text-center">
        <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Пока пусто</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Добавьте товары из каталога</p>
      </div>
      <Button onClick={() => navigate('/')}>В каталог</Button>
    </div>
  );
}

export function ErrorState({ message = 'Каталог временно недоступен, попробуйте позже' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 px-6 text-center">
      <p className="text-base" style={{ color: 'var(--text-secondary)' }}>{message}</p>
    </div>
  );
}
