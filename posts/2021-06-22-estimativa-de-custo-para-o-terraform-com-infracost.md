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
Recentemente comentaram sobre essa ferramenta na empresa em que trabalho e logo decidimos acata-la, o Infracost realiza a estimativa de custo para os nossos projetos com Terraform.

Durante todo o artigo iremos presupor que o Terraform já encontra-se instalado em sua máquina dessa forma precisamos instalar o Infracost, para isso siga a orientação para o seu sistema operacional:

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

Para utilizarmos precisamos registrar para solicitar uma API Key gratuita, dessa forma só precisamos executar o seguinte comando:

```
infracost register
```

Feito isso, já estamos prontos para utilizar os comandos no CLI, através dele temos duas opções de estimativas, a primeira é o detalhamento completo dos custos utilizando o comando:

```
infracost breakdown --path .
```

Observe a saida do comando:

![sumario](/assets/img/infra-sumario.png)

A segunda forma é a geração de um relatório que mostra as diferenças de custos mensais entre o estado atual e planejádo

```
infracost diff --path .
```

Observe a saida do comando:

![diff](/assets/img/infra-diff.png)

A sua utilização principal basea-se nesses dois comandos, fora isso temos algumas variantes para isso basta executar comando seguido de `--help`.

E é assim que a ferramenta Infracost funciona, ela pode ser facilmente inclusa na sua ferramenta de CI, basta seguir a documentação oficial na página da [ferramenta](https://www.infracost.io/docs/integrations/cicd).

Espero que essa tecnologia sejá tão útil para vocês assim como tem sido pra mim, boa semana!