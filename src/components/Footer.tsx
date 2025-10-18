import Icon from '@/components/ui/icon';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">© 2025 TeamReg. Все права защищены.</p>
          <div className="flex gap-4">
            <Icon name="Github" size={20} className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            <Icon name="Twitter" size={20} className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            <Icon name="Linkedin" size={20} className="text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}
