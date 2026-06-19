import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Pega a tentativa de login do navegador
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // === COLOQUE SEU USUÁRIO E SENHA AQUI ===
    if (user === 'admin' && pwd === 'senha123') {
      return NextResponse.next(); // Deixa entrar!
    }
  }

  // Se não estiver logado ou errar a senha, bloqueia a tela
  return new NextResponse('Acesso Negado: Área Restrita do Casal', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Controle Financeiro"',
    },
  });
}

// Isso garante que o cadeado proteja a página principal
export const config = {
  matcher: '/',
};