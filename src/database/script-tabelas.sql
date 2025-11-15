CREATE DATABASE solarData01;
USE solarData01;

CREATE TABLE TipoUsuario (
    idTipo INT PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(45) NOT NULL,
    permissao VARCHAR(45) NOT NULL
);


CREATE TABLE Endereco (
    idEndereco INT PRIMARY KEY AUTO_INCREMENT,
    cep CHAR(8) NOT NULL,
    logradouro VARCHAR(45) NOT NULL,
    numero VARCHAR(45) NOT NULL,
    uf CHAR(2) NOT NULL,
    complemento VARCHAR(45)
);

CREATE TABLE Empresa (
    idEmpresa INT PRIMARY KEY AUTO_INCREMENT,
    fkEndereco INT NOT NULL,
    razaoSocial VARCHAR(45) NOT NULL,
    nomeFantasia VARCHAR(45),
    cnpj CHAR(14) UNIQUE NOT NULL,
    FOREIGN KEY (fkEndereco) REFERENCES Endereco(idEndereco)
);

CREATE TABLE Usuario (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    fkEmpresa INT,
    email VARCHAR(45) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(45) NOT NULL,
    tokenRecuperacao CHAR(6) DEFAULT NULL,
    fkTipoUsuario INT,
    FOREIGN KEY (fkEmpresa) REFERENCES Empresa(idEmpresa),
    FOREIGN KEY (fkTipoUsuario) REFERENCES TipoUsuario(idTipo)
);

CREATE TABLE Contato (
    idContato INT PRIMARY KEY AUTO_INCREMENT,
    telefone CHAR(11) UNIQUE,
    email VARCHAR(45) UNIQUE,
    fkEmpresa INT,
    FOREIGN KEY (fkEmpresa) REFERENCES Empresa(idEmpresa)
);

CREATE TABLE ChaveAtivacao (
    idChaveAtivacao INT PRIMARY KEY AUTO_INCREMENT,
    chave CHAR(6) UNIQUE NOT NULL,
    validade DATETIME NOT NULL,
    usos INT NOT NULL,
    fkEmpresa INT NOT NULL,
    FOREIGN KEY (fkEmpresa) REFERENCES Empresa(idEmpresa)
);

CREATE TABLE Maquina (
    hostName INT PRIMARY KEY,
    identificador VARCHAR(255) NOT NULL,
    fkEmpresa INT NOT NULL,
    macAdress CHAR(17) UNIQUE NOT NULL,
    ip VARCHAR(45) NOT NULL,
    dtCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fkEmpresa) REFERENCES Empresa(idEmpresa)
);


CREATE TABLE Componente (
    idComponente INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(45) NOT NULL,
    quantidade INT NOT NULL,
    unidadeDeMedida VARCHAR(45) NOT NULL,
    fkMaquina INT NOT NULL,
    FOREIGN KEY (fkMaquina) REFERENCES Maquina(hostName)
);

-- nivel agora calculado automaticamente
CREATE TABLE Metrica (
    idMetrica INT PRIMARY KEY AUTO_INCREMENT,
    min DOUBLE NOT NULL,
    max DOUBLE NOT NULL,
    fkComponente INT NOT NULL UNIQUE,
    FOREIGN KEY (fkComponente) REFERENCES Componente(idComponente)
);

-- Java (unificando processos)
CREATE TABLE Processo (
	idProcesso INT primary key auto_increment,
    pid INT NOT NULL,
    nome VARCHAR(100),
    cpuPorcentagem DOUBLE,
    ramPorcentagem DOUBLE,
    fkMaquina INT NOT NULL,
    tipo ENUM('QUENTE', 'FRIO') DEFAULT 'FRIO',
    dtRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fkMaquina) REFERENCES Maquina(hostName)
);

-- Python
CREATE TABLE Registro (
    idRegistro INT PRIMARY KEY AUTO_INCREMENT,
    captura DOUBLE NOT NULL,
    dtRegistro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fkComponente INT NOT NULL,
    FOREIGN KEY (fkComponente) REFERENCES Componente(idComponente)
);


CREATE TABLE Alerta (
    idAlerta INT PRIMARY KEY AUTO_INCREMENT,
    dtHora DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('CRITICO', 'ALERTA', 'NORMAL') NOT NULL,
    captura DOUBLE NOT NULL,
    fkMetrica INT,
    fkRegistro INT,
    fkComponente INT,
    descricao VARCHAR(255),
    FOREIGN KEY (fkComponente) REFERENCES Componente(idComponente),
    FOREIGN KEY (fkMetrica) REFERENCES Metrica(idMetrica),
    FOREIGN KEY (fkRegistro) REFERENCES Registro(idRegistro)
);



-- Função para calculo de nível
DELIMITER //
CREATE FUNCTION calcularNivelLinux(
    captura DOUBLE, 
    min_val DOUBLE, 
    max_val DOUBLE,
    componente_nome VARCHAR(45)
) 
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    DECLARE percentual DOUBLE;
    DECLARE nivel VARCHAR(20);
    
    SET percentual = ((captura - min_val) / (max_val - min_val)) * 100;
    
    CASE 
        WHEN componente_nome LIKE 'CPU%' THEN
            IF percentual >= 90 THEN SET nivel = 'CRITICO';
            ELSEIF percentual >= 80 THEN SET nivel = 'ALERTA';
            ELSE SET nivel = 'NORMAL'; END IF;
            
        WHEN componente_nome LIKE 'RAM%' THEN
            IF percentual >= 95 THEN SET nivel = 'CRITICO';
            ELSEIF percentual >= 85 THEN SET nivel = 'ALERTA';
            ELSE SET nivel = 'NORMAL'; END IF;
            
        WHEN componente_nome LIKE 'DISK_ROOT%' THEN
            IF percentual >= 95 THEN SET nivel = 'CRITICO';
            ELSEIF percentual >= 85 THEN SET nivel = 'ALERTA';
            ELSE SET nivel = 'NORMAL'; END IF;
            
        WHEN componente_nome LIKE 'DISK_%' THEN
            IF percentual >= 98 THEN SET nivel = 'CRITICO';
            ELSEIF percentual >= 90 THEN SET nivel = 'ALERTA';
            ELSE SET nivel = 'NORMAL'; END IF;
            
        WHEN componente_nome LIKE 'TEMP%' THEN
            IF captura >= max_val THEN SET nivel = 'CRITICO';
            ELSEIF captura >= (max_val * 0.9) THEN SET nivel = 'ALERTA';
            ELSE SET nivel = 'NORMAL'; END IF;
            
        WHEN componente_nome LIKE 'LOAD%' THEN
            IF captura >= max_val THEN SET nivel = 'CRITICO';
            ELSEIF captura >= (max_val * 0.8) THEN SET nivel = 'ALERTA';
            ELSE SET nivel = 'NORMAL'; END IF;
            
        ELSE
            -- Regra padrão do nível 
            IF percentual >= 90 THEN SET nivel = 'CRITICO';
            ELSEIF percentual >= 70 THEN SET nivel = 'ALERTA';
            ELSE SET nivel = 'NORMAL'; END IF;
    END CASE;
    
    RETURN nivel;
END//
DELIMITER ;

CREATE VIEW vw_monitoramento_linux AS
SELECT 
    m.idMetrica,
    c.nome as componente,
    r.captura,
    m.min,
    m.max,
    calcularNivelLinux(r.captura, m.min, m.max, c.nome) as nivel,
    r.dtRegistro,
    ma.hostname,
    ma.ip
FROM Metrica m
JOIN Componente c ON m.fkComponente = c.idComponente
JOIN Registro r ON r.fkComponente = c.idComponente
JOIN Maquina ma ON c.fkMaquina = ma.idMaquina;


-- INSERÇÃO DE MÉTRICAS COM VALORES REALISTAS PARA LINUX

-- (0, 80, 1),    -- CPU: 80% max (conservador para servidor)
-- (0, 90, 2),    -- RAM: 90% max (Linux usa RAM agressivamente)
-- (0, 85, 3),    -- DISK_ROOT: 85% max (raiz cheia é crítico!)
-- (0, 95, 4),    -- DISK_HOME: 95% max 
-- (0, 90, 5),    -- DISK_VAR: 90% max (logs podem crescer)
-- (20, 75, 6),   -- TEMP_CPU: 75°C max
-- (0, 60, 7),    -- SWAP: 60% max (swap alto em servidor é alarme)
-- (0, 6, 8),     -- LOAD_AVG: 6.0 max (para 8 cores = 6.0)
-- (0, 90, 9);    -- NETWORK: 90% da capacidade


-- (estudar isso para inserir no lugar das funções assincronas de tempo)
-- SELECT * FROM Alerta 
-- WHERE dtHora >= NOW() - INTERVAL 1 HOUR 
-- ORDER BY dtHora DESC;

-- Trigger automaticos para linux
DELIMITER //
CREATE TRIGGER alerta_linux_after_insert
AFTER INSERT ON Registro
FOR EACH ROW
BEGIN
    DECLARE v_componente_nome VARCHAR(45);
    DECLARE v_min, v_max DOUBLE;
    DECLARE v_estado VARCHAR(20);
    
    SELECT c.nome, m.min, m.max 
    INTO v_componente_nome, v_min, v_max
    FROM Componente c
    JOIN Metrica m ON c.idComponente = m.fkComponente
    WHERE c.idComponente = NEW.fkComponente;
    
    -- Calculo de estado especifico do linux
    SET v_estado = calcularNivelLinux(NEW.captura, v_min, v_max, v_componente_nome);
    
    -- Insere alerta se anormal
    IF v_estado != 'NORMAL' THEN
        INSERT INTO Alerta (estado, captura, fkRegistro, fkComponente, descricao)
        VALUES (v_estado, NEW.captura, NEW.idRegistro, NEW.fkComponente,
                CONCAT('Servidor Linux - ', v_componente_nome, ': ', 
                       ROUND(NEW.captura, 1), unidadeDeMedida, ' - ', v_estado));
    END IF;
END//
DELIMITER ;







-- Inserir Endereço primeiro
INSERT INTO Endereco (cep, logradouro, numero, uf, complemento) 
VALUES ('01234567', 'Rua das Flores', '123', 'SP', 'Sala 101');

-- Inserir Empresa
INSERT INTO Empresa (fkEndereco, razaoSocial, nomeFantasia, cnpj)
VALUES (1, 'Solar Servers Solutions Ltda', 'SolarTech', '12345678000195');

-- Inserir Tipo de Usuário
INSERT INTO TipoUsuario (tipo, permissao) 
VALUES 
('Administrador', 'Total'),
('Usuário', 'Limitada');


-- Inserir Usuário
INSERT INTO Usuario (fkEmpresa, email, senha, nome, fkTipoUsuario)
VALUES (1, 'techsolardata@gmail.com', 'senha123', 'João Silva', 1);

-- Inserir Contato
INSERT INTO Contato (telefone, email, fkEmpresa)
VALUES ('11999998888', 'contato@solarservers.com', 1);

-- Inserir Chave de Ativação
INSERT INTO ChaveAtivacao (chave, validade, usos, fkEmpresa)
VALUES ('A1B2C3', '2024-12-31 23:59:59', 10, 1);

-- Inserir a Máquina com hostname 1598329989
INSERT INTO Maquina (hostName, identificador, fkEmpresa, macAdress, ip)
VALUES (1598329989, 'Server-PROD-01', 1, '00:1B:44:11:3A:B7', '192.168.1.100');

-- Inserir Componentes para esta máquina
INSERT INTO Componente (nome, quantidade, unidadeDeMedida, fkMaquina) 
VALUES 
('CPU', 1, '%', 1598329989),
('RAM', 1, '%', 1598329989),
('DISCO', 1, '%', 1598329989);
-- ('DISK_HOME', 1, '%', 1598329989),
-- ('DISK_VAR', 1, '%', 1598329989),
-- ('TEMP_CPU', 1, '°C', 1598329989),
-- ('SWAP', 1, '%', 1598329989),
-- ('LOAD_AVG', 1, 'unidades', 1598329989),
-- ('NETWORK', 1, '%', 1598329989);

-- Inserir Métricas para os componentes
INSERT INTO Metrica (min, max, fkComponente) 
VALUES 
(0, 80, 1),    -- CPU: 80% max
(0, 90, 2),    -- RAM: 90% max
(0, 85, 3);    -- DISK_ROOT: 85% max
-- (0, 95, 4),    -- DISK_HOME: 95% max
-- (0, 90, 5),    -- DISK_VAR: 90% max
-- (20, 75, 6),   -- TEMP_CPU: 75°C max
-- (0, 60, 7),    -- SWAP: 60% max
-- (0, 6, 8),     -- LOAD_AVG: 6.0 max
-- (0, 90, 9);    -- NETWORK: 90% max

