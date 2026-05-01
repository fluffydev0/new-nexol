const Footer = () => {
  return (
    <footer className="border-t border-border py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-display font-extrabold text-foreground">
          <img src="/favicon.png" alt="NexolPay" className="w-7 h-7 rounded-md" />
          NexolPay
        </div>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} NexolPay. Built for Nigeria, powered by Base.</p>
      </div>
    </footer>
  );
};

export default Footer;
