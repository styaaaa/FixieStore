const BrandPartners = () => {
  const brands = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour'];

  return (
    <section className="bg-muted py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Our Brand Partners</h2>
        <div className="flex flex-wrap justify-center gap-8 items-center">
          {brands.map((brand) => (
            <div 
              key={brand}
              className="px-8 py-4 bg-background rounded-lg shadow-sm"
            >
              <span className="text-lg font-semibold text-muted-foreground">
                {brand}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandPartners;
