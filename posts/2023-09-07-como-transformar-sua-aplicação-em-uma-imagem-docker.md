---
image: /assets/img/docker-logo.png
title: Como Transformar Sua Aplicação em uma Imagem Docker
description: "Dockerização, ou containerização, é o processo de empacotar uma
  aplicação e suas dependências em um contêiner Docker, uma unidade leve e
  isolada que pode ser executada de maneira consistente em qualquer ambiente que
  suporte o Docker. "
date: 2023-09-07
category: devops
background: "#05A6F0"
tags:
  - DOCKER
  - AWS
  - DEVOPS
  - NGINX
categories:
  - DOCKER
  - AWS
  - DEVOPS
  - NGINX
---
Essa abordagem utiliza tecnologia de contêineres para encapsular todo o ambiente de execução de uma aplicação, tornando-a portátil e independente de infraestrutura.

A transformação de uma aplicação em uma imagem Docker envolve algumas etapas essenciais. Vamos seguir um exemplo prático usando um servidor web Nginx para containerizar um site estático simples.

Há várias razões pelas quais a dockerização de uma aplicação é benéfica:

1. **Portabilidade**: Um contêiner Docker contém todos os componentes necessários para a execução de uma aplicação, incluindo bibliotecas, código e configurações. Isso garante que a aplicação seja executada de forma consistente em diferentes ambientes, como desenvolvimento, teste e produção.

2. **Isolamento**: Os contêineres são isolados uns dos outros e do host, o que significa que as dependências de uma aplicação não interferem nas de outra. Isso evita conflitos de versões e problemas de compatibilidade.

3. **Facilidade de Implantação**: Os contêineres podem ser implantados rapidamente, reduzindo o tempo de implantação e simplificando a gestão de implantações em escala.

4. **Escalabilidade**: É fácil dimensionar aplicativos em contêineres horizontalmente, adicionando ou removendo contêineres conforme a demanda, o que melhora a capacidade de resposta em situações de alto tráfego.

5. **Gerenciamento de Recursos**: Os contêineres Docker permitem a alocação de recursos específicos, como CPU e memória, para aplicativos individuais, garantindo um uso eficiente dos recursos do host.

6. **Padronização**: A dockerização promove práticas de desenvolvimento e implantação padronizadas, simplificando a colaboração entre equipes e o gerenciamento de infraestrutura.

7. **Facilidade de Backup e Recuperação**: Os contêineres podem ser facilmente copiados e movidos, facilitando a criação de backups e a recuperação de desastres.

### 1. Crie o Dockerfile:

O Dockerfile é um arquivo de configuração que define como sua imagem Docker será construída. Crie um arquivo chamado `Dockerfile` (sem extensão) com o seguinte conteúdo:

```Dockerfile
# Use uma imagem de base leve do Nginx
FROM nginx:alpine

# Copie o arquivo HTML do host para o diretório de trabalho da imagem
COPY index.html /usr/share/nginx/html

# Exponha a porta 80 para tráfego da web
EXPOSE 80

# Comando para iniciar o servidor Nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Estrutura do Projeto:

Certifique-se de que a estrutura do seu projeto inclui o arquivo Dockerfile e o arquivo HTML que você deseja enviar para o container (vamos chamá-lo de `index.html`).

```
seu_projeto/
|-- Dockerfile
|-- index.html
```

### 3. Construa a Imagem Docker:

Abra um terminal na pasta onde seu `Dockerfile` está localizado e execute o seguinte comando para construir a imagem Docker:

```bash
docker build -t meu-site-nginx .
```

Isso criará uma imagem com o nome `meu-site-nginx` a partir do Dockerfile atual.

### 4. Execute o Container:

Agora que você tem a imagem Docker construída, pode executar um contêiner a partir dela com o seguinte comando:

```bash
docker run -d -p 8080:80 meu-site-nginx
```

Isso iniciará um contêiner Docker a partir da imagem `meu-site-nginx`, vinculando a porta 8080 do host à porta 80 do contêiner. Você pode acessar seu site estático abrindo um navegador e navegando para `http://localhost:8080`.

Você transformou com sucesso sua aplicação em uma imagem Docker, enviou um arquivo HTML para o container e executou-o usando o servidor web Nginx. Esse é apenas o começo das possibilidades oferecidas pela containerização, facilitando o gerenciamento e a implantação de aplicativos de maneira consistente e eficiente.