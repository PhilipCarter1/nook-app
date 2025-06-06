import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      <Link
        href="/"
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          pathname === '/' ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        Home
      </Link>
      <Link
        href="/features"
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          pathname === '/features' ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        Features
      </Link>
      <Link
        href="/contact"
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          pathname === '/contact' ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        Contact
      </Link>
      {user ? (
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Sign Out
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              pathname === '/login' ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            Sign In
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </div>
      )}
    </nav>
  );
} 