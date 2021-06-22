---
image: /assets/img/HashiCorp-Terraform-logo.png
title: "Estimativa de custo para o Terraform com Infracost "
description: Infracost é uma ferramenta de código aberto que ajuda DevOps, SRE e
  desenvolvedores a reduzir continuamente seus custos de nuvem.
date: 2021-06-20
category: devops
background: "#05A6F0"
tags:
  - Terraform
  - infracost
---
Recentemente comentaram sobre essa ferramenta na empresa em que trabalho e logo decidimos acata-la, o Infracost realiza a estimativa de custo para os nossos projetos com terraform.

Durante todo o nosso projeto iremos presupor que o terraform ja encontra-se instalado em sua maquina dessa forma precisamos instalar o infracost, para isso siga a orientaçao para o seu sistema operacional:

```
# Brew
brew install infracost

# Linux
curl -fsSL https://raw.githubusercontent.com/infracost/infracost/master/scripts/install.sh | sh

# Docker
docker pull infracost/infracost
docker run --rm \
  -e INFRACOST_API_KEY=see_following_step_on_how_to_get_this \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -v $PWD/:/code/ infracost/infracost breakdown --path /code/
```

Para utilizarmos precisamos nos registrar para solicitar uma API Key gratuita, dessa forma so precisamos executar o seguinte comando:

```
infracost register
```

Feito isso, ja estamos prontos para utilizar os comandos atraves do CLI, atraves dele temos duas opçoes de estimativas, a primeira e o detalhamento completo dos custos utilizando o comando:

```
infracost breakdown --path .
```

Observe a saida do comando:

A segunda forma e a geraçao de um relatorio que mostra as diferenças de custos mensais entre o estado atual e planejado

```
infracost diff --path .
```

Observe a saida do comando:







