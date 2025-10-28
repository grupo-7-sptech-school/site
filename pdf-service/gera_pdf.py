import requests
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch, cm
from reportlab.pdfgen import canvas

class GeradorRelatorioSolarData:
    def __init__(self, base_url, logo_path=None):
        self.base_url = base_url.rstrip('/')
        self.logo_path = logo_path  # Caminho para a imagem do cabeçalho
        self.styles = self._criar_estilos()
    
    def _criar_cabecalho(self, canvas, doc):
        """Cria o cabeçalho personalizado com logo"""
        canvas.saveState()
        
        if self.logo_path:
            try:
                logo = Image(self.logo_path, width=1.5*inch, height=1.5*inch)
                logo.drawOn(canvas, 1*cm, doc.pagesize[1] - 2*cm)
            except:
                print("Não carregou a logo")
        
        # Texto do cabeçalho
        canvas.setFont("Helvetica-Bold", 14)
        canvas.drawString(4*cm, doc.pagesize[1] - 1.5*cm, "RELATÓRIO TÉCNICO DE MONITORAMENTO DO SISTEMA - EMPRESA")
        
        canvas.setFont("Helvetica", 12)
        canvas.drawString(4*cm, doc.pagesize[1] - 2.2*cm, "MONITORAMENTO DOS ÚLTIMOS PROCESSOS")
        
        # Linha separadora
        canvas.setStrokeColor(colors.HexColor('#2C3E50'))
        canvas.setLineWidth(1)
        canvas.line(1*cm, doc.pagesize[1] - 2.8*cm, doc.pagesize[0] - 1*cm, doc.pagesize[1] - 2.8*cm)
        
        canvas.restoreState()
    
    def _criar_rodape(self, canvas, doc):
        """Cria o rodapé personalizado"""
        canvas.saveState()
        
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor('#7F8C8D'))
        
        # Texto do rodapé
        texto_rodape = "SOLARDATA - Monitoramento de Servidores Verdes - Tecnologia de análise inteligente para eficiência computacional e sustentabilidade."
        canvas.drawString(2*cm, 1*cm, texto_rodape)
        
        # Número da página
        pagina = f"Página {doc.page}"
        canvas.drawRightString(doc.pagesize[0] - 2*cm, 1*cm, pagina)
        
        canvas.restoreState()
    
    def _criar_estilos(self):
        """Cria estilos personalizados seguindo o modelo do Word"""
        styles = getSampleStyleSheet()
        
        estilos_personalizados = {}
        
        # Título principal (já no cabeçalho, mas mantido para compatibilidade)
        estilos_personalizados['MainTitle'] = ParagraphStyle(
            name='MainTitle',
            parent=styles['Title'],
            fontSize=16,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=20,
            alignment=1,
            fontName='Helvetica-Bold'
        )
        
        # Títulos de seção (como "Visão Geral", "Estatísticas Gerais")
        estilos_personalizados['SectionTitle'] = ParagraphStyle(
            name='SectionTitle',
            parent=styles['Heading2'],
            fontSize=13,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=12,
            spaceBefore=20,
            fontName='Helvetica-Bold',
            leftIndent=0
        )
        
        # Subtítulos (como dentro das seções)
        estilos_personalizados['SubSection'] = ParagraphStyle(
            name='SubSection',
            parent=styles['Heading3'],
            fontSize=11,
            textColor=colors.HexColor('#34495E'),
            spaceAfter=8,
            spaceBefore=15,
            fontName='Helvetica-Bold',
            leftIndent=10
        )
        
        # Texto normal
        estilos_personalizados['BodyText'] = ParagraphStyle(
            name='BodyText',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=6,
            alignment=4,  # Justificado
            leftIndent=0
        )
        
        # Itens de lista
        estilos_personalizados['ListItem'] = ParagraphStyle(
            name='ListItem',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=4,
            leftIndent=20,
            bulletIndent=10
        )
        
        # Alertas
        estilos_personalizados['AlertText'] = ParagraphStyle(
            name='AlertText',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.red,
            spaceAfter=6,
            leftIndent=20,
            fontName='Helvetica-Bold'
        )
        
        # Texto de conclusão/destaque
        estilos_personalizados['ConclusionText'] = ParagraphStyle(
            name='ConclusionText',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#2C3E50'),
            spaceAfter=8,
            alignment=1,  # Centralizado
            fontName='Helvetica-Bold'
        )
        
        return estilos_personalizados
    
    def descobrir_url_api(self):
        """Tenta descobrir a URL correta da API (mantido igual)"""
        urls_possiveis = [
            f"{self.base_url}/analisar-processos",
            f"{self.base_url}/api/analisar-processos",
            f"{self.base_url}/api/processos",
            f"{self.base_url}/processos"
        ]
        
        for url in urls_possiveis:
            try:
                print(f"Testando: {url}")
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    dados = response.json()
                    if dados.get('success') or 'analise' in dados:
                        print(f" URL encontrada: {url}")
                        return url
            except Exception as e:
                print(f"{url} - {e}")
        
        return None
    
    def obter_dados_api(self):
        """Busca dados da API (mantido igual)"""
        url_api = self.descobrir_url_api()
        
        if not url_api:
            print( "Não foi possível encontrar a URL da API")
            return None
        
        try:
            print("Conectando à API...")
            response = requests.get(url_api, timeout=10)
            response.raise_for_status()
            
            dados = response.json()
            
            if dados.get('success'):
                print(" Dados obtidos com sucesso!")
                return dados
            else:
                print("f API retornou erro: {dados.get('message')}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"Erro ao acessar API: {e}")
            return None
    
    def _extrair_dados_secao(self, analise, secao_nome):
        """Extrai dados específicos de cada seção da análise"""
        linhas = analise.split('\n')
        secao_encontrada = False
        dados_secao = []
        
        for linha in linhas:
            linha = linha.strip()
            if not linha:
                continue
            
            if linha == secao_nome:
                secao_encontrada = True
                continue
            
            if secao_encontrada:
                if linha in ['GERAL', 'ALERTAS', 'CATEGORIAS', 'TOP 5 CPU', 'TOP 5 RAM', 'RESUMO']:
                    break
                if linha and ':' in linha:
                    dados_secao.append(linha)
        
        return dados_secao
    
    def gerar_relatorio_pdf(self, output_file=None):
        """Gera o relatório PDF seguindo o modelo do Word"""
        
        dados_api = self.obter_dados_api()  # ← Busca dados
        if not dados_api:
            return False
        
        analise = dados_api.get('analise', '')
        
        # Nome do arquivo
        if not output_file:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"relatorio_tecnico_solardata_{timestamp}.pdf"
        
        print("Gerando PDF")
        
        # Criar documento com cabeçalho e rodapé personalizados
        doc = SimpleDocTemplate(
            output_file, 
            pagesize=A4,
            topMargin=3*cm,  # Espaço para o cabeçalho
            bottomMargin=2*cm  # Espaço para o rodapé
        )
        
        elements = []
        
        # ===== VISÃO GERAL =====
        elements.append(Paragraph("Visão Geral", self.styles['SectionTitle']))
        elements.append(Paragraph(
            "O presente relatório apresenta uma análise técnica detalhada do desempenho do sistema, "
            "com base na coleta e processamento de métricas em tempo real sobre <b>uso de CPU, memória RAM e processos ativos</b>. "
            "O objetivo é identificar possíveis gargalos, riscos de sobrecarga e oportunidades de otimização de recursos computacionais.",
            self.styles['BodyText']
        ))
        
        elements.append(Spacer(1, 15))
        
        # ===== ESTATÍSTICAS GERAIS =====
        elements.append(Paragraph("Estatísticas Gerais", self.styles['SectionTitle']))
        
        # Extrair dados da seção GERAL
        dados_geral = self._extrair_dados_secao(analise, 'GERAL')
        
        # Texto introdutório
        elements.append(Paragraph(
            "Esses indicadores oferecem uma visão consolidada do estado operacional do sistema no instante da análise, "
            "servindo de base para detecção de anomalias e avaliação de desempenho.",
            self.styles['BodyText']
        ))
        
        elements.append(Spacer(1, 8))
        
        # Adicionar itens da seção GERAL
        for item in dados_geral:
            if ':' in item:
                elements.append(Paragraph(f"• {item}", self.styles['ListItem']))
        
        elements.append(Spacer(1, 15))
        
        # ===== ANÁLISE DE MEMÓRIA =====
        elements.append(Paragraph("Análise de Memória", self.styles['SectionTitle']))
        
        # Extrair dados específicos de memória
        elementos_memoria = [
            "RAM utilizada por processos:",
            "RAM de sistema/cache:", 
            "Eficiência de memória:"
        ]
        
        for item in elementos_memoria:
            # Buscar valor correspondente nos dados
            valor = "Dado não disponível"
            for dado in dados_geral:
                if item.split(':')[0] in dado:
                    valor = dado.split(':')[1].strip()
                    break
            elements.append(Paragraph(f"• {item} {valor}", self.styles['ListItem']))
        
        elements.append(Spacer(1, 8))
        
        # Texto explicativo
        elements.append(Paragraph(
            "A eficiência de memória reflete o equilíbrio entre consumo e disponibilidade de recursos. "
            "Valores próximos a <b>\"Excelente\"</b> indicam boa gestão de recursos, enquanto <b>\"Baixa\"</b> sinaliza risco de gargalos e lentidão.",
            self.styles['BodyText']
        ))
        
        elements.append(Spacer(1, 15))
        
        # ===== ALERTAS DO SISTEMA =====
        elements.append(Paragraph("Alertas do Sistema", self.styles['SectionTitle']))
        
        # Extrair alertas
        alertas = self._extrair_dados_secao(analise, 'ALERTAS')
        
        if alertas:
            for alerta in alertas:
                if not alerta.endswith(':'):  # Evitar títulos vazios
                    elements.append(Paragraph(f"• {alerta}", self.styles['AlertText']))
        else:
            elements.append(Paragraph("• Nenhum alerta crítico identificado", self.styles['BodyText']))
        
        elements.append(Spacer(1, 8))
        
        elements.append(Paragraph(
            "Cada alerta representa uma possível condição de risco ou sobrecarga que deve ser verificada. "
            "Recomenda-se atenção especial a eventos de <b>alta utilização de CPU ou memória</b>, bem como "
            "<b>múltiplos processos críticos simultâneos</b>.",
            self.styles['BodyText']
        ))
        
        elements.append(Spacer(1, 15))
        
        # ===== DISTRIBUIÇÃO POR CATEGORIA =====
        elements.append(Paragraph("Distribuição por Categoria de Processos", self.styles['SectionTitle']))
        
        elementos_categorias = self._extrair_dados_secao(analise, 'CATEGORIAS')
        
        if elementos_categorias:
            for categoria in elementos_categorias:
                elements.append(Paragraph(f"• {categoria}", self.styles['ListItem']))
        else:
            elements.append(Paragraph("• Dados de categorização não disponíveis", self.styles['BodyText']))
        
        elements.append(Spacer(1, 8))
        
        elements.append(Paragraph(
            "A categorização permite identificar áreas de maior consumo de recursos, facilitando o planejamento de ações específicas por tipo de aplicação.",
            self.styles['BodyText']
        ))
        
        elements.append(Spacer(1, 15))
        
        # ===== TOP 5 CONSUMO =====
        elements.append(Paragraph("Top 5 -- Consumo de CPU", self.styles['SubSection']))
        
        top_cpu = self._extrair_dados_secao(analise, 'TOP 5 CPU')
        for item in top_cpu:
            elements.append(Paragraph(item, self.styles['BodyText']))
        
        elements.append(Spacer(1, 8))
        
        elements.append(Paragraph("Top 5 -- Consumo de Memória", self.styles['SubSection']))
        
        top_ram = self._extrair_dados_secao(analise, 'TOP 5 RAM')
        for item in top_ram:
            elements.append(Paragraph(item, self.styles['BodyText']))
        
        elements.append(Spacer(1, 8))
        
        elements.append(Paragraph(
            "Esses rankings ajudam a identificar quais aplicações representam o maior peso sobre os recursos computacionais, "
            "sendo úteis para diagnóstico e priorização de otimizações.",
            self.styles['BodyText']
        ))
        
        elements.append(Spacer(1, 15))
        
        # ===== RESUMO DE SAÚDE DO SISTEMA =====
        elements.append(Paragraph("Resumo de Saúde do Sistema", self.styles['SectionTitle']))
        
        # Extrair status geral
        status_geral = "Status não disponível"
        dados_resumo = self._extrair_dados_secao(analise, 'RESUMO')
        
        for item in dados_resumo:
            if 'STATUS GERAL:' in item:
                status_geral = item.split('STATUS GERAL: ')[1] if 'STATUS GERAL: ' in item else 'N/A'
                break
        
        elements.append(Paragraph(f"• <b>Status Geral:</b> {status_geral}", self.styles['ListItem']))
        elements.append(Paragraph(f"• <b>Data e hora da análise:</b> {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", self.styles['ListItem']))
        
        elements.append(Spacer(1, 8))
        
        elements.append(Paragraph(
            "A condição geral é classificada conforme o nível de utilização dos principais recursos e a quantidade de processos críticos ativos, "
            "variando entre os estados <b>\"OK\"</b>, <b>\"Atenção\"</b> e <b>\"Crítico\"</b>.",
            self.styles['BodyText']
        ))
        
        elements.append(Spacer(1, 20))
        
        # ===== CONCLUSÃO =====
        elements.append(Paragraph(
            "O relatório tem como propósito mapear de forma mais ampla os processos da empresa, "
            "auxiliando os analistas na tomada de decisões com base em dados confiáveis e atualizados.",
            self.styles['ConclusionText']
        ))
        
        elements.append(Spacer(1, 10))
        
        elements.append(Paragraph(
            "Gerado automaticamente pelo sistema SOLARDATA -- Monitoramento de Servidores Verdes.",
            self.styles['ConclusionText']
        ))
        
        doc.build(elements, onFirstPage=self._criar_cabecalho, onLaterPages=self._criar_cabecalho)
        print(f"PDF gerado no formato solicitado: {output_file}")
        return True
    
    def gerar_relatorio_pdf_com_dados(self, dados_api, output_file=None):
        """
        gera PDF a partir de dados JSON já obtidos
        """
        print("Iniciando geração de PDF")
        
        if not dados_api:
            print("Dados não fornecidos para geração do PDF")
            return False
        
        # Extrai a análise do JSON
        analise = dados_api.get('analise', '')
        
        if not analise:
            print("Dados de análise não encontrados no JSON")
            return False
        
        # Nome do arquivo
        if not output_file:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"relatorio_solardata_{timestamp}.pdf"
        
        print(f"Gerando: {output_file}")
        
        # Criar documento
        doc = SimpleDocTemplate(
            output_file, 
            pagesize=A4,
            topMargin=3*cm,
            bottomMargin=2*cm
        )
        
        elements = []
        
        elements.append(Paragraph("Visão Geral", self.styles['SectionTitle']))
        elements.append(Paragraph(
            "O presente relatório apresenta uma análise técnica detalhada do desempenho do sistema, "
            "com base na coleta e processamento de métricas em tempo real sobre <b>uso de CPU, memória RAM e processos ativos</b>. "
            "O objetivo é identificar possíveis gargalos, riscos de sobrecarga e oportunidades de otimização de recursos computacionais.",
            self.styles['BodyText']
        ))
        
        elements.append(Spacer(1, 15))
        
        # ===== ESTATÍSTICAS GERAIS =====
        elements.append(Paragraph("Estatísticas Gerais", self.styles['SectionTitle']))
        
        dados_geral = self._extrair_dados_secao(analise, 'GERAL')
        
        elements.append(Paragraph(
            "Esses indicadores oferecem uma visão consolidada do estado operacional do sistema no instante da análise, "
            "servindo de base para detecção de anomalias e avaliação de desempenho.",
            self.styles['BodyText']
        ))
        
        elements.append(Spacer(1, 8))
        
        for item in dados_geral:
            if ':' in item:
                elements.append(Paragraph(f"• {item}", self.styles['ListItem']))
        
        elements.append(Spacer(1, 15))
        
        # ===== ANÁLISE DE MEMÓRIA =====
        elements.append(Paragraph("Análise de Memória", self.styles['SectionTitle']))
        
        # Extrair dados específicos de memória
        elementos_memoria = [
            "RAM utilizada por processos:",
            "RAM de sistema/cache:", 
            "Eficiência de memória:"
        ]
        
        for item in elementos_memoria:
            valor = "Dado não disponível"
            for dado in dados_geral:
                if item.split(':')[0] in dado:
                    valor = dado.split(':')[1].strip()
                    break
            elements.append(Paragraph(f"• {item} {valor}", self.styles['ListItem']))
        
        elements.append(Spacer(1, 8))
        
        elements.append(Paragraph(
            "A eficiência de memória reflete o equilíbrio entre consumo e disponibilidade de recursos. "
            "Valores próximos a <b>\"Excelente\"</b> indicam boa gestão de recursos, enquanto <b>\"Baixa\"</b> sinaliza risco de gargalos e lentidão.",
            self.styles['BodyText']
        ))
        
        elements.append(Spacer(1, 15))
        
        # ===== ALERTAS DO SISTEMA =====
        elements.append(Paragraph("Alertas do Sistema", self.styles['SectionTitle']))
        
        alertas = self._extrair_dados_secao(analise, 'ALERTAS')
        
        if alertas:
            for alerta in alertas:
                if not alerta.endswith(':'):
                    elements.append(Paragraph(f"• {alerta}", self.styles['AlertText']))
        else:
            elements.append(Paragraph("• Nenhum alerta crítico identificado", self.styles['BodyText']))
        
        elements.append(Spacer(1, 8))
        
        elements.append(Paragraph(
            "Cada alerta representa uma possível condição de risco ou sobrecarga que deve ser verificada. "
            "Recomenda-se atenção especial a eventos de <b>alta utilização de CPU ou memória</b>, bem como "
            "<b>múltiplos processos críticos simultâneos</b>.",
            self.styles['BodyText']
        ))
        
        elements.append(Spacer(1, 15))
        
        # ===== DISTRIBUIÇÃO POR CATEGORIA =====
        elements.append(Paragraph("Distribuição por Categoria de Processos", self.styles['SectionTitle']))
        
        elementos_categorias = self._extrair_dados_secao(analise, 'CATEGORIAS')
        
        if elementos_categorias:
            for categoria in elementos_categorias:
                elements.append(Paragraph(f"• {categoria}", self.styles['ListItem']))
        else:
            elements.append(Paragraph("• Dados de categorização não disponíveis", self.styles['BodyText']))
        
        elements.append(Spacer(1, 8))
        
        elements.append(Paragraph(
            "A categorização permite identificar áreas de maior consumo de recursos, facilitando o planejamento de ações específicas por tipo de aplicação.",
            self.styles['BodyText']
        ))
        
        elements.append(Spacer(1, 15))
        
        # ===== TOP 5 CONSUMO =====
        elements.append(Paragraph("Top 5 -- Consumo de CPU", self.styles['SubSection']))
        
        top_cpu = self._extrair_dados_secao(analise, 'TOP 5 CPU')
        for item in top_cpu:
            elements.append(Paragraph(item, self.styles['BodyText']))
        
        elements.append(Spacer(1, 8))
        
        elements.append(Paragraph("Top 5 -- Consumo de Memória", self.styles['SubSection']))
        
        top_ram = self._extrair_dados_secao(analise, 'TOP 5 RAM')
        for item in top_ram:
            elements.append(Paragraph(item, self.styles['BodyText']))
        
        elements.append(Spacer(1, 8))
        
        elements.append(Paragraph(
            "Esses rankings ajudam a identificar quais aplicações representam o maior peso sobre os recursos computacionais, "
            "sendo úteis para diagnóstico e priorização de otimizações.",
            self.styles['BodyText']
        ))
        
        elements.append(Spacer(1, 15))
        
        # ===== RESUMO DE SAÚDE DO SISTEMA =====
        elements.append(Paragraph("Resumo de Saúde do Sistema", self.styles['SectionTitle']))
        
        status_geral = "Status não disponível"
        dados_resumo = self._extrair_dados_secao(analise, 'RESUMO')
        
        for item in dados_resumo:
            if 'STATUS GERAL:' in item:
                status_geral = item.split('STATUS GERAL: ')[1] if 'STATUS GERAL: ' in item else 'N/A'
                break
        
        elements.append(Paragraph(f"• <b>Status Geral:</b> {status_geral}", self.styles['ListItem']))
        elements.append(Paragraph(f"• <b>Data e hora da análise:</b> {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", self.styles['ListItem']))
        
        elements.append(Spacer(1, 8))
        
        elements.append(Paragraph(
            "A condição geral é classificada conforme o nível de utilização dos principais recursos e a quantidade de processos críticos ativos, "
            "variando entre os estados <b>\"OK\"</b>, <b>\"Atenção\"</b> e <b>\"Crítico\"</b>.",
            self.styles['BodyText']
        ))
        
        elements.append(Spacer(1, 20))
        
        # ===== CONCLUSÃO =====
        elements.append(Paragraph(
            "O relatório tem como propósito mapear de forma mais ampla os processos da empresa, "
            "auxiliando os analistas na tomada de decisões com base em dados confiáveis e atualizados.",
            self.styles['ConclusionText']
        ))
        
        elements.append(Spacer(1, 10))
        
        elements.append(Paragraph(
            "Gerado automaticamente pelo sistema SOLARDATA -- Monitoramento de Servidores Verdes.",
            self.styles['ConclusionText']
        ))
        
        # Gerar PDF
        doc.build(elements, onFirstPage=self._criar_cabecalho, onLaterPages=self._criar_cabecalho)
        print(f"PDF gerado com sucesso: {output_file}")
        return output_file

def testar_conexoes():
    """Testa várias URLs possíveis"""
    urls_base = [
        "http://localhost:3333",
        "http://localhost:3000", 
        "http://127.0.0.1:3333",
        "http://localhost:8080",
        "http://localhost:80",
        "http://34.198.76.254:80"
    ]
    
    for base_url in urls_base:
        print(f"\nTestando site: {base_url}")
        gerador = GeradorRelatorioSolarData(base_url, logo_path="caminho/para/sua/logo.png")
        sucesso = gerador.gerar_relatorio_pdf()
        
        if sucesso:
            print(f"Sucesso com: {base_url}")
            break
    else:
        print("\n Nenhuma URL funcionou.")

if __name__ == "__main__":
    print("Iniciando geração de relatório técnico...")
    
    # Opção 1: Teste automático
    testar_conexoes()
    
    # Opção 2: URL específica (descomente e use se souber a URL)
    # API_URL = "http://localhost:3333"
    # gerador = GeradorRelatorioSolarData(API_URL, logo_path="caminho/para/logo.png")
    # gerador.gerar_relatorio_pdf()