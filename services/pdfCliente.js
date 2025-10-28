const axios = require('axios');

class PDFClient {
    constructor() {
        this.baseURL = process.env.PDF_SERVICE_URL || 'http://localhost:5000';
        this.client = axios.create({
            baseURL: this.baseURL,
            timeout: 30000,
        });
    }

    async generatePDF(monitoringData) {
        try {
            console.log('Enviando dados para serviço PDF...');
            
            const response = await this.client.post('/generate-pdf', 
                monitoringData, 
                { 
                    responseType: 'stream'
                }
            );
            
            console.log(' PDF gerado');
            return response.data;
        } catch (error) {
            console.error('Erro no serviço PDF:', error.message);
            throw new Error(`Falha ao gerar PDF: ${error.message}`);
        }
    }

    async healthCheck() {
        try {
            await this.client.get('/health');
            return true;
        } catch (error) {
            console.error('Serviço PDF indisponível');
            return false;
        }
    }
}

module.exports = new PDFClient();
