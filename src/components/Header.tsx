interface HeaderProps {
  cartItemCount: number;
  onSearchChange: (query: string) => void;
  transparent?: boolean;
}

export const Header = ({ cartItemCount, onSearchChange, transparent }: HeaderProps) => {
  return (
    <header className={`sticky top-0 z-50 ${transparent ? 'bg-transparent' : 'bg-background border-b'}`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">FixieStore</h1>
          <div className="flex items-center gap-4">
            <span>Cart ({cartItemCount})</span>
          </div>
        </div>
      </div>
    </header>
  );
};
