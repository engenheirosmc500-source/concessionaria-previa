import { defineConfig } from 'vite';
import { resolve } from 'path';

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
        main: resolve(__dirname, 'index.html'),
        estoque: resolve(__dirname, 'estoque.html'),
        veiculo: resolve(__dirname, 'veiculo.html'),
        contato: resolve(__dirname, 'contato.html'),
        loja: resolve(__dirname, 'a-loja.html'),
        favoritos: resolve(__dirname, 'favoritos.html'),
        financiamento: resolve(__dirname, 'financiamento.html'),
        privacidade: resolve(__dirname, 'privacidade.html'),
        venda: resolve(__dirname, 'venda-seu-veiculo.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        adminLogin: resolve(__dirname, 'admin/login.html'),
        adminVeiculos: resolve(__dirname, 'admin/veiculos.html'),
        adminVeiculoForm: resolve(__dirname, 'admin/veiculo-form.html'),
        adminLeads: resolve(__dirname, 'admin/leads.html'),
        adminConfig: resolve(__dirname, 'admin/configuracoes.html'),
        adminPerfil: resolve(__dirname, 'admin/perfil.html'),
        adminRecuperar: resolve(__dirname, 'admin/recuperar-senha.html'),
        adminUsuarios: resolve(__dirname, 'admin/usuarios.html'),
        adminVendedores: resolve(__dirname, 'admin/vendedores.html')
      }
    }
  }
});
