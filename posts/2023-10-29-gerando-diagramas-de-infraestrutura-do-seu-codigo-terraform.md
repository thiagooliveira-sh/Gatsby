---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Gerando diagramas de infraestrutura do seu código Terraform
description: "Compreendo a importância de abordar mais a fundo a questão da
  documentação em projetos, especialmente no que diz respeito à parte gráfica e
  ao uso do Terraform. A documentação desempenha um papel crucial na compreensão
  e na manutenção de um projeto, garantindo a colaboração eficaz entre as
  equipes e a continuidade do trabalho. "
date: 2023-10-28
category: devops
background: "#05A6F0"
tags:
  - Terraforn
  - Terravision
  - IaC
  - AWS
  - DevOps
categories:
  - Terraforn
  - Terravision
  - IaC
  - AWS
  - DevOps
---
O Terraform, reconhecido pela sua capacidade de descrever e provisionar infraestrutura em diversos provedores de nuvem, é uma peça central em muitos pipelines de desenvolvimento e operações. No entanto, a complexidade dos projetos Terraform pode dificultar a compreensão da arquitetura geral, especialmente à medida que a infraestrutura cresce e se ramifica.

É nesse ponto que ferramentas como o terraform-docs e o terravision entram em jogo. Elas simplificam e automatizam a geração de documentação e diagramas, tornando a visualização da infraestrutura muito mais acessível e compreensível para todos os membros da equipe.

### Terraform-docs: Automatizando a Documentação

O terraform-docs uma ferramenta valiosa que simplifica a geração de documentação para módulos, recursos e variáveis do Terraform. Ele cria uma documentação clara e concisa, que pode incluir descrições, exemplos de uso e informações sobre os parâmetros esperados, ajudando não apenas na compreensão imediata, mas também no uso correto dos componentes.

### Terravision: Visualizando a Infraestrutura

Já o terravision é uma ferramenta poderosa para gerar diagramas visuais da infraestrutura criada com Terraform. Ele traduz o código Terraform em representações gráficas, como diagramas de blocos, fluxogramas ou grafos, fornecendo uma visão clara da interconexão entre recursos, módulos e dependências.

## Instalação

Os métodos de instalação para ambos são bastante distintos. Começando pelo terraform-docs, a forma mais simples é usar o modelo pré-compilado. No entanto, ele também pode ser instalado via Homebrew ou através do Go, oferecendo múltiplas opções para os usuários.

```
curl -sSLo ./terraform-docs.tar.gz https://terraform-docs.io/dl/v0.16.0/terraform-docs-v0.16.0-$(uname)-amd64.tar.gz
tar -xzf terraform-docs.tar.gz
chmod +x terraform-docs
mv terraform-docs /some-dir-in-your-PATH/terraform-docs
```

Para o Terravision, precisamos primeiro garantir que o [graphviz](https://graphviz.org/download/) esteja instalado feito isso basta clonar o projeto do Terravision no github e instalar o requirements: 

```
git clone https://github.com/patrickchugh/terravision.git
cd terravision
pip install -r requirements.txt
chmod +x terravision
```

É ﻿interessante que você realize a instalação em um path que fique exportado para o seu usuário ou que faça o export manual depois.

## Utilização terraform-docs

A utilização de ambas as ferramentas é simples. Vamos explorar alguns comandos e variações para cada uma. O Terraform-docs é reconhecido por gerar documentações em vários formatos, como AsciiDoc, JSON, Markdown, entre outros. Um dos formatos mais populares é o `markdown table`, ideal para criar arquivos README.

```
terraform-docs markdown table --output-file README.md --output-mode inject ./
```

Sim, o formato `markdown table` é amplamente reconhecido e se assemelha ao que frequentemente encontramos no Terraform Public Registry. Aqui está um exemplo desse formato:

```markdown
| Name       | Description          | Type   | Default | Required |
|------------|----------------------|--------|---------|----------|
| region     | AWS region to deploy | string | us-west-2 | yes      |
| instance_type | Type of EC2 instance | string | t2.micro | no      |
| key_name   | SSH key name         | string | -       | yes      |
```

Esse formato estruturado em tabela facilita a visualização das variáveis, suas descrições, tipos, valores padrão e se são obrigatórias ou não, fornecendo uma referência rápida e clara para quem está usando ou contribuindo para o projeto.

## Utilização terravision

O `Terravision` é uma ferramenta relativamente nova, e como tal, pode apresentar algumas limitações na geração de recursos específicos. Caso encontrem qualquer problema ao criar ou visualizar diagramas para determinados recursos, encorajo a comunidade a abrir uma issue no GitHub. A equipe costuma ser ágil na resolução de problemas e no aprimoramento da ferramenta, garantindo uma experiência cada vez melhor para todos os usuários. 

Partindo para o uso prático da ferramenta, essa é uma abordagem direta e versátil para gerar diagramas usando o `terravision`. É possível criar diagramas de repositórios locais ou remotos com comandos simples, como:

Local:

```
terravision draw --source ~/src/meu-código-terraform
```

Remoto (Git):

```
terravision draw --source https://github.com/seu-repo/exemplos-terraform.git
```

Os diagramas resultantes oferecem uma representação visual da arquitetura do Terraform, destacando a estrutura e as relações entre os recursos, simplificando a compreensão da infraestrutura de forma clara e direta. Como por exemplo esse examplo simples de um diagrama com load balancer e ec2:

![Diagrama](/assets/img/architecture.dot.png)

Segue alguns projetos para utilizar de exemplo:

```
terravision draw --source https://github.com/futurice/terraform-examples.git//aws/aws_static_site --varfile examples/variables.tfvars --show

terravision draw --source https://github.com/futurice/terraform-examples.git//aws/wordpress_fargate --varfile examples/variables.tfvars --show

terravision draw --source https://github.com/k-mitevski/terraform-k8s.git//01_terraform_eks --show
```

Ao explorarmos as capacidades do `terraform-docs` e do `terravision`, percebemos o quão essenciais são essas ferramentas para a documentação e visualização da infraestrutura no Terraform. Desde a geração de documentações detalhadas em diferentes formatos até a criação de diagramas claros e informativos, esses recursos simplificam a compreensão e colaboração em projetos complexos. 

Agradeço por acompanharem essa exploração e espero que a utilização dessas ferramentas torne seus projetos mais transparentes e acessíveis para toda a equipe. Até a próxima!