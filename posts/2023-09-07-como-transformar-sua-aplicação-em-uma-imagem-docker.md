---
image: /assets/img/docker-logo.png
title: Como Transformar Sua Aplicação em uma Imagem Docker
description: "Dockerização, ou containerização, é o processo de empacotar uma
  aplicação e suas dependências em um contêiner Docker, uma unidade leve e
  isolada que pode ser executada de maneira consistente em qualquer ambiente que
  suporte o Docker. "
date: 2023-09-30
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
A utilização de contêineres, como o Docker, revolucionou a forma como desenvolvemos e implantamos aplicações. Essa abordagem utiliza a tecnologia de contêineres para encapsular todo o ambiente de execução de uma aplicação, tornando-a altamente portátil e independente de infraestrutura. Neste contexto, é possível perceber uma série de benefícios significativos para o desenvolvimento de software e outras áreas afins.

Em resumo, o Docker e a tecnologia de contêineres revolucionaram a forma como desenvolvemos, testamos e implantamos software, proporcionando uma maior flexibilidade, eficiência e consistência em todo o ciclo de vida de desenvolvimento de aplicações. Há várias razões pelas quais a dockerização de uma aplicação é benéfica:

1. **Portabilidade**: Um contêiner Docker contém todos os componentes necessários para a execução de uma aplicação, incluindo bibliotecas, código e configurações. Isso garante que a aplicação seja executada de forma consistente em diferentes ambientes, como desenvolvimento, teste e produção.

2. **Isolamento**: Os contêineres são isolados uns dos outros e do host, o que significa que as dependências de uma aplicação não interferem nas de outra. Isso evita conflitos de versões e problemas de compatibilidade.

3. **Facilidade de Implantação**: Os contêineres podem ser implantados rapidamente, reduzindo o tempo de implantação e simplificando a gestão de implantações em escala.

4. **Escalabilidade**: É fácil dimensionar aplicativos em contêineres horizontalmente, adicionando ou removendo contêineres conforme a demanda, o que melhora a capacidade de resposta em situações de alto tráfego.

5. **Gerenciamento de Recursos**: Os contêineres Docker permitem a alocação de recursos específicos, como CPU e memória, para aplicativos individuais, garantindo um uso eficiente dos recursos do host.

6. **Padronização**: A dockerização promove práticas de desenvolvimento e implantação padronizadas, simplificando a colaboração entre equipes e o gerenciamento de infraestrutura.

7. **Facilidade de Backup e Recuperação**: Os contêineres podem ser facilmente copiados e movidos, facilitando a criação de backups e a recuperação de desastres.


O propósito deste artigo é oferecer uma introdução ao conceito básico da dockerização de uma aplicação. Vamos abordar o processo de dockerização de um site estático, uma tarefa simples que permitirá a hospedagem por meio do servidor web Nginx. No entanto, é importante destacar que a dockerização vai além de simplesmente mover arquivos para dentro de contêineres; envolve a criação de imagens Docker otimizadas, com camadas bem estruturadas.

A dockerização pode ser realizada de diversas maneiras. Para ilustrar, consideremos o exemplo de dockerização de uma aplicação Node.js. Neste caso, podemos empregar um único arquivo `Dockerfile` para compilar a aplicação e disponibilizar os recursos estáticos para serem servidos pelo Nginx. Vejamos um exemplo prático:

```Dockerfile
# Use a imagem oficial do Node.js como base
FROM node:14 AS build
WORKDIR /app

# Copie o arquivo package.json e package-lock.json para o diretório de trabalho
COPY package*.json ./
RUN npm install
COPY . .

# Build da aplicação Node.js (substitua 'npm start' pelo comando real para iniciar sua aplicação)
RUN npm run build

# Etapa para a criação da imagem do Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

# Comando para iniciar o Nginx quando o contêiner for executado
CMD ["nginx", "-g", "daemon off;"]
```

### 1. Crie o Dockerfile:

O Dockerfile é um arquivo de configuração essencial que desempenha um papel crítico na definição de como a sua imagem Docker será construída. Ele contém uma série de instruções que orientam o processo de criação dessa imagem. Vamos criar um arquivo chamado `Dockerfile` (sem extensão) e detalhar as instruções que você pode utilizar para personalizar o ambiente do seu contêiner Docker:

1. **Escolha da Imagem Base:** Comece especificando qual imagem base você deseja utilizar como ponto de partida. Por exemplo, vamos hospedar uma pagina html no Nginx, iniciaremos com a imagem oficial do Nginx, como `nginx:alpine`.

2. **Cópia de Arquivos:** Utilize a instrução `COPY` para copiar arquivos e diretórios do seu sistema local para dentro do contêiner. Isso inclui geralmente os arquivos de código-fonte da sua aplicação.

3. **Comandos de Configuração:** Você pode executar uma série de comandos no Dockerfile para configurar a aplicação dentro do contêiner. Isso pode incluir a instalação de dependências, compilação de código e qualquer configuração necessária.

4. **Exposição de Porta:** Se a sua aplicação precisar expor uma porta para ser acessível de fora do contêiner, utilize a instrução `EXPOSE` para especificar qual porta será exposta.

5. **Comando de Inicialização:** A instrução `CMD` define qual comando será executado quando o contêiner for iniciado. Isso normalmente inclui o comando que inicia a sua aplicação.

Depois de criar o seu Dockerfile com essas instruções e personalizá-lo de acordo com as necessidades da sua aplicação, segue o nosso `Dockerfile`:

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

Certifique-se de que a estrutura do seu projeto inclui o arquivo Dockerfile e os arquivos HTML que você deseja enviar para o container.

```
Project/
|-- Dockerfile
|-- index.html
```

### 3. Construa a Imagem Docker:

Abra seu terminal na pasta onde seu `Dockerfile` está localizado e usar o seguinte comando para construir a imagem Docker:

```bash
docker build -t meu-site-nginx:1.0 .
```

- `docker build`: Isso inicia o processo de construção de uma imagem Docker.
- `-t meu-site-nginx:1.0`: Esta parte define o nome da imagem que você está construindo e sua tag.
- `.`: Isso indica ao Docker para procurar o `Dockerfile` no diretório atual.

Portanto, depois de executar esse comando, o Docker construirá a imagem com base no conteúdo e nas instruções do seu `Dockerfile`. Certifique-se de que você esteja no diretório correto com o `Dockerfile` antes de executar o comando, isso criará uma imagem com o nome `meu-site-nginx` a partir do Dockerfile atual.

### 4. Execute o Container:

Agora que você construiu a imagem Docker, pode executar um contêiner a partir dela usando o seguinte comando:

```bash
docker run -d -p 8080:80 meu-site-nginx
```

- `docker run`: Isso inicia a execução de um contêiner a partir da imagem especificada.
- `-p porta_host:porta_contêiner`: Esta parte mapeia uma porta do host  para uma porta dentro do contêiner. Substitua `porta_host` pela porta que deseja usar no host e `porta_contêiner` pela porta dentro do contêiner onde sua aplicação está ouvindo. Por exemplo, na nossa aplicação o Nginx esta ouvindo na porta 80 dentro do contêiner e desejo mapeá-la para a porta 8080 no host, use `-p 8080:80`.
- `-d`: Isso inicia o contêiner em segundo plano.
- `nome_da_sua_imagem:tag`: Especifique o nome da imagem Docker que você deseja usar para criar o contêiner, incluindo a tag se você a atribuiu durante a construção.

Isso iniciará um contêiner Docker a partir da imagem `meu-site-nginx`, vinculando a porta 8080 do host à porta 80 do contêiner. Você pode acessar seu site estático abrindo um navegador e navegando para `http://localhost:8080`.

Agradeço por acompanhar até este ponto. Se você está aqui, é sinal de que já dominou com êxito o processo de transformar sua aplicação em uma imagem Docker, enviou um arquivo HTML para o contêiner e o executou usando o servidor web Nginx. No entanto, considere que isso é apenas o ponto de partida em relação às infinitas possibilidades que a containerização oferece. 