document.addEventListener('DOMContentLoaded', () => {
  // --- NAVEGAÇÃO ENTRE ABAS ---
  const pages = document.querySelectorAll('.page');
  const navButtons = document.querySelectorAll('.nav-btn');

  function showPage(pageId) {
    pages.forEach(page => page.classList.remove('active'));
    navButtons.forEach(btn => btn.classList.remove('active'));
    const newActivePage = document.getElementById(pageId);
    if (newActivePage) newActivePage.classList.add('active');
    const newActiveButton = document.querySelector(`.nav-btn[data-page="${pageId}"]`);
    if (newActiveButton) newActiveButton.classList.add('active');
  }

  navButtons.forEach(button => {
    button.addEventListener('click', () => {
      const pageId = button.dataset.page;
      if (pageId) {
        showPage(pageId);
      }
    });
  });

  // --- INICIALIZAÇÃO DA API GEN AI COM IMAGEM ---
  async function initGenAI() {
    const { GoogleGenerativeAI } = window.genai || {};
    if (!GoogleGenerativeAI) {
      console.warn("Biblioteca da IA ainda não carregou.");
      setTimeout(initGenAI, 200);
      return;
    }

    console.log("Google IA carregada com sucesso.");
    const API_KEY = "AIzaSyCDCIGryt5OB16pY1IHc_e_Fix3-Uajaco"; // <--- Cole aqui sua chave válida
    const genAI = new GoogleGenerativeAI(API_KEY);

    const generateBtn = document.getElementById('generate-commercial-btn');
    const lovableImageInput = document.getElementById('lovable-image');
    const lovableResultDiv = document.getElementById('lovable-result');
    const lovableLoading = document.getElementById('lovable-loading');

    if (generateBtn) {
      generateBtn.addEventListener('click', async () => {
        if (!lovableImageInput || !lovableImageInput.files || lovableImageInput.files.length === 0) {
          alert("Selecione uma imagem primeiro!");
          return;
        }

        const file = lovableImageInput.files[0];

        if (lovableLoading) lovableLoading.style.display = 'block';
        if (lovableResultDiv) lovableResultDiv.style.display = 'none';
        generateBtn.disabled = true;
        generateBtn.textContent = 'Gerando...';

        try {
          const imagePart = await fileToGenerativePart(file);
          const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
          const prompt = `
            Você é um especialista em marketing para pequenos produtores.
            Crie um roteiro curto e cativante para um vídeo comercial de 30 segundos para redes sociais, com base nesta imagem.
            Divida em:
            1. Cena Rápida (5s) para chamar atenção;
            2. Narração Principal (20s) com benefícios, origem e sabor do produto;
            3. Chamada para Ação (5s), como "Peça já o seu!".
          `;

          const result = await model.generateContent([prompt, imagePart]);
          const text = await result.response.text();
          lovableResultDiv.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          lovableResultDiv.style.display = 'block';
        } catch (err) {
          console.error(err);
          lovableResultDiv.innerText = "Erro ao gerar comercial. Verifique sua chave de API e permissões do modelo Gemini Vision.";
          lovableResultDiv.style.display = 'block';
        } finally {
          lovableLoading.style.display = 'none';
          generateBtn.disabled = false;
          generateBtn.textContent = 'Gerar Comercial';
        }
      });
    }

    async function fileToGenerativePart(file) {
      const base64EncodedDataPromise = new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(file);
      });
      return {
        inlineData: {
          data: await base64EncodedDataPromise,
          mimeType: file.type,
        },
      };
    }
  }

  initGenAI();
});
