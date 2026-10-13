import { defineConfig } from 'vite';
import { resolve } from 'path';

const currentDir = import.meta.dirname;

export default defineConfig({
  server: {
    port: 3000,
    open: false,
    strictPort: false
  },
  preview: {
    port: 3000
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(currentDir, 'index.html'),
        estoque: resolve(currentDir, 'estoque.html'),
        veiculo: resolve(currentDir, 'veiculo.html'),
        contato: resolve(currentDir, 'contato.html'),
        loja: resolve(currentDir, 'a-loja.html'),
        favoritos: resolve(currentDir, 'favoritos.html'),
        financiamento: resolve(currentDir, 'financiamento.html'),
        privacidade: resolve(currentDir, 'privacidade.html'),
        venda: resolve(currentDir, 'venda-seu-veiculo.html'),
        admin: resolve(currentDir, 'admin/index.html'),
        adminLogin: resolve(currentDir, 'admin/login.html'),
        adminVeiculos: resolve(currentDir, 'admin/veiculos.html'),
        adminVeiculoForm: resolve(currentDir, 'admin/veiculo-form.html'),
        adminLeads: resolve(currentDir, 'admin/leads.html'),
        adminConfig: resolve(currentDir, 'admin/configuracoes.html'),
        adminPerfil: resolve(currentDir, 'admin/perfil.html'),
        adminRecuperar: resolve(currentDir, 'admin/recuperar-senha.html'),
        adminUsuarios: resolve(currentDir, 'admin/usuarios.html'),
        adminVendedores: resolve(currentDir, 'admin/vendedores.html')
      }
    }
  }
});
