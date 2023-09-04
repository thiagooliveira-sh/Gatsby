---
image: /assets/img/bash.png
title: Nos Bastidores do Meu Blog Arquitetura e CI/CD
description: Vamos dar uma olhada nos bastidores do meu blog! Descubra como tudo
  funciona, desde a estrutura do site até como eu mantenho o conteúdo
  atualizado. Vou te contar sobre as tecnologias e truques que uso para tornar o
  processo de publicação suave e divertido!
date: 2023-09-04
category: devops
background: "#05A6F0"
tags:
  - cicd
  - netlify
  - gatsby
  - github
  - blog
  - devops
categories:
  - cicd
  - netlify
  - gatsby
  - github
  - blog
  - devops
---
Aqui, eu vou te contar tudo sobre a arquitetura que sustenta este espaço digital, e como algumas tecnologias como o GitHub, Gatsby, Netlify, Algolia e Cloudflare fazem tudo isso acontecer. Desde o primeiro rascunho de um novo post até o momento em que você o lê, vamos explorar como essas ferramentas se unem para tornar tudo possível.

Eu sou daquele tipo de pessoa que aprende melhor quando documenta o processo de aprendizado. Eu gosto de criar minitutoriais para absorver o conteúdo de forma mais eficaz e para que possa consultá-los quando necessário.

Embora tenha formação em computação e um foco em desenvolvimento, minha carreira me levou para a área de infraestrutura, onde tenho atuado como analista de infraestrutura e cloud.

Antes mesmo de entrar no mercado de tecnologia, eu já brincava criando blogs no Blogspot, Wix e WordPress. Foi durante um estágio que decidi começar a construir o meu próprio blog, porque meu Sublime estava abarrotado de arquivos e ficava difícil encontrar o que eu precisava.

Não posso dizer que o blog foi totalmente fruto do meu trabalho. Na época, utilizei um curso na Udemy como guia para criar e organizar o template que vocês conhecem hoje.

Então, vou compartilhar com vocês todas as tecnologias que usei, explicar como funciona o processo de criação de artigos, qual sistema de gerenciamento de conteúdo eu utilizei e qual mecanismos de busca eu implementei, entre outras tecnologias.

### Tecnologias do Blog

Quando decidi criar meu site, duas coisas eram essenciais para mim: responsividade e velocidade. Comecei a pesquisar várias tecnologias e encontrei materiais sobre a construção de sites estáticos. Comecei com Hugo.io, mas depois optei pelo Gatsby com GraphQL. O material de apoio e curso na Udemy que encontrei na época foi fundamental para me orientar durante o processo de construção.

### Versionamento

Para o controle de versão do projeto, você pode escolher a plataforma que melhor atenda às suas necessidades, como o GitLab. No meu caso, optei pelo GitHub, onde mantenho um repositório público do meu blog, acessível para qualquer pessoa. 

![blog-1](/assets/img/blog-1.png)

Escolhi o GitHub porque é amplamente conhecido, na época da faculdade era a plataforma git que os professores indicavam e, como meu foco atual não envolve a utilização de ferramentas nativas de integração contínua, como GitHub Actions ou GitLab CI, ele atendeu bem às minhas necessidades.

### Mecanismo de busca

Para a funcionalidade de busca no meu site, escolhi o Algolia, uma ferramenta proprietária que oferece um nível gratuito com excelente capacidade de indexação e fácil integração. Pude criar ambientes na plataforma para os meus ambientes de desenvolvimento e produção. Atualmente, grandes empresas o utilizam para aprimorar a busca em seus próprios sites como lacoste, decathlon, coursera entre outrtas. 

![blog-2](/assets/img/blog-2.png)

### CMS

Para o sistema de CMS do blog, optei por não usar o WordPress, para evitar a necessidade de um banco de dados ou hospedar conteúdo de forma dinâmica. Meu objetivo era manter o site completamente estático, então escolhi a ferramenta Netlify CMS.

![blog-3](/assets/img/blog-3.png)

O Netlify CMS está integrado ao meu repositório Git, então meu login é feito através o OAUTH do GitHub, e todo o processo de criação de artigos é realizado por meio de operações Git. As publicações são formatadas em Markdown, e quando um novo artigo é publicado, ocorre um merge na branch master nos bastidores, o que desencadeia um novo processo de build e publicação.

![blog-4](/assets/img/blog-4.png)

Além disso, o CMS permite que eu pré-visualize um artigo em revisão, gerando links de visualização para que eu possa verificar como ele ficará antes de ser publicado oficialmente.

### Plugins

Para entender melhor o desempenho do meu site e identificar oportunidades de melhoria, integrei o Google Analytics. Isso me permite acompanhar quais publicações geram mais engajamento e entender o que posso fazer para criar conteúdo ainda mais atrativo para os visitantes. Com esses insights, estou constantemente trabalhando para aprimorar o meu blog e oferecer um conteúdo de maior qualidade.

![blog-5](/assets/img/blog-5.png)

### Cloudflare

Para hospedar minha zona DNS e aproveitar alguns benefícios extras, como certificado SSL, CDN, proxy e a capacidade de programar uma página de manutenção, escolhi utilizar o Cloudflare. Eles oferecem um plano gratuito que atende perfeitamente às minhas necessidades, proporcionando maior segurança e desempenho ao meu site.

![blog-6](/assets/img/blog-6.png)

Sobre a pagina de manutenção, já fiz um artigo sobre isso em outro momento, e você pode consultar através desse [link](https://thiagoalexandria.com.br/hospedar-pagina-de-manutencao-no-cloudflare/).

### Integração continua e hospedagem

Para a automação, continuouse integration e continuous deployment, eu acabei optando pelo uso da plataforma Netlify, a mesma que desenvolve o nosso CMS, lembra? A Netlify é uma plataforma de hospedagem e implantação muito popular, especialmente para hospedar sites estáticos, e ela adota a filosofia do GitOps em sua abordagem para hospedagem e implantação.

![blog-8](/assets/img/blog-8.png)

Da mesma forma que todas as ferramentas selecionadas, a Netlify também oferece um nível gratuito que me permite realizar até 300 minutos de compilação por mês sem incorrer em custos, apenas para conhecimento, um build para o meu blog leva em torno de 1 a 2 minutos, então consigo fazer até 150 build por mês. Além disso, ao hospedar meu site na plataforma, recebo 100 GB de largura de banda, e com a integração com o Cloudflare, essa quantidade de largura de banda é mantida praticamente inalterada devido à camada de cache externo gratuita.

Embora eu pudesse usar meu próprio domínio, garantir uma conexão segura exigiria um certificado SSL válido. Nesse sentido, aproveito o serviço de certificado SSL do Cloudflare, que fornece um certificado válido, garantindo que meu site esteja disponível apenas via HTTPS, proporcionando segurança aos visitantes.

![blog-7](/assets/img/blog-7.png)

### Custos

Para manter o blog operando de acordo com o princípio de otimização de custos, optei por escolher plataformas que oferecessem um nível gratuito e que me permitissem trabalhar dentro desse limite. 

Durante a montagem da infraestrutura de hospedagem, considerei a possibilidade de dockerizar o blog e, por meio de uma esteira no GitHub Actions, realizar publicações periódicas usando o ECS. No entanto, essa abordagem geraria custos adicionais, como o uso de um balanceador de carga, ECS Fargate, minutos de pipeline e armazenamento de imagens Docker.

Como resultado, para simplificar a gestão da infraestrutura e permanecer dentro dos limites gratuitos, optei por utilizar principalmente serviços SaaS. Isso manteve o blog operacional sem exceder o nível gratuito, com a única necessidade de renovar o domínio DNS anualmente.

E assim, compartilho esse processo com vocês, esperando que tenham apreciado entender melhor como o blog funciona, quais tecnologias estão envolvidas, o motivo de escolher cada componente e a razão por trás da nossa arquitetura. Espero que isso inspire vocês, assim como me inspirei a começar e criar esse material de apoio.