from flask import Flask, request, send_file
from flask_cors import CORS
import tempfile
import os
import sys
import logging

# Adicionar o diretório atual ao path para importar gera_pdf
sys.path.append('/app/pdf-service')

from gera_pdf import GeradorRelatorioSolarData

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return {"status": "healthy", "service": "pdf-generator"}

@app.route('/generate-pdf', methods=['POST'])
def generate_pdf():
    try:
        logger.info("Recebendo dados para gerar PDF...")
        
        data = request.get_json()
        if not data:
            return {"error": "Nenhum dado recebido"}, 400
        
        # Usar a classe existente sem fazer requisições HTTP
        generator = GeradorRelatorioSolarData("")
        
        # Criar arquivo temporário
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            output_path = tmp_file.name
        
        # Gerar PDF usando o NOVO método
        result = generator.gerar_relatorio_pdf_com_dados(data, output_path)
        
        if result:
            logger.info(f" PDF gerado com sucesso: {output_path}")
            return send_file(
                output_path,
                as_attachment=True,
                download_name="relatorio_solardata.pdf",
                mimetype='application/pdf'
            )
        else:
            return {"error": "Falha na geração do PDF"}, 500
            
    except Exception as e:
        logger.error(f"Erro no servidor PDF: {str(e)}")
        return {"error": f"Erro interno: {str(e)}"}, 500

if __name__ == '__main__':
    logger.info("Serviço PDF iniciando na porta 5000")
    app.run(host='0.0.0.0', port=5000, debug=False)