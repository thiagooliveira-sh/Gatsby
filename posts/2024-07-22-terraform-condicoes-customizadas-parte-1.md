---
image: /assets/img/HashiCorp-Terraform-logo.png
title: "Terraform condições customizadas - Parte 1 "
description: O Terraform possui diversas alternativas para validar variáveis e
  configurações dentro do seu código. Essas validações ajudam a evitar erros e
  seguir boas práticas, assegurando que a infraestrutura seja robusta e
  confiável.
date: 2024-07-22
category: devops
background: "#05A6F0"
tags:
  - terraform
  - devops
  - sre
  - cloud
  - aws
categories:
  - terraform
  - devops
  - sre
  - cloud
  - aws
---
Ao utilizar Terraform para provisionar infraestrutura, é crucial implementar condições customizadas para garantir a integridade e a eficácia da configuração. As diferentes condições customizadas do Terraform são adequadas para diversas situações, e selecionar a melhor opção pode fazer a diferença na qualidade do ambiente gerenciado. Aqui temos quais as são as alternativas disponíveis para implementarmos com o Terraform.

* **Check blocks**: validam sua infraestrutura como um todo. Além disso, os blocos de verificação não impedem ou bloqueiam a execução geral das operações do Terraform.
* **Condições de validação ou pós-condições de saída**: garantem que as entradas e saídas da sua configuração atendam a requisitos específicos.
* **Pré-condições e pós-condições de recursos**: validam que o Terraform produz sua configuração com resultados previsíveis.

N﻿esse primeiro post vamos falar sobre os Check blocks.

## Por que utilizar Checks?

Checks podem validar qualquer condição que você defina nas configurações do seu código Terraform. Um check pode validar um atributo da sua infraestrutura, ou uma funcionalidade do recurso, por exemplo. 

É ﻿importante frisar que as checagens ocorrem fora do ciclo de vida usual dos recursos. Ou seja, você pode adicionar condições customizadas através do bloco `assert` que são executados ao final das etapas de `plan` e `apply` notificando sempre sobre os possíveis problemas na sua infraestrutura.

## Introdução

Você pode adicionar um ou mais `assert` dentro de um `check` para verificar condições personalizadas. Dessa forma, cada `assert` requer uma definição de `condition`, essa condição deve ser `booleana` obrigatoriamente retornando `true`, abaixo temos o esqueleto dessa configuração:

```hcl
check "health_check" {
  data "http" "thiagoalexandria" {
    url = "https://www.thiagoalexandria.com.br
  }

  assert {
    condition = data.http.thiagoalexandria.status_code == 200
    error_message = "${data.http.terraform_io.url} retornou um status diferente de 200
  }
}
```

Se a `condition` for avaliada como `false`, o Terraform produzirá uma mensagem de erro que inclui o resultado da `error_message`. Se você declarar várias `asserts`, o Terraform retornará mensagens de erro para todas as condições com falha.

## Exemplos e passo a passo

V﻿amos trazer dois exemplos práticos que podem ser utilizados no dia a dia corporativo, como forma de guard rails para criação de recursos, por exemplo: 

* Evitar utilização de runtimes desatualizados no lambda
  -﻿ Verificar se as tags são fornecidas para alocação de custos

### Evitar utilização de runtimes desatualizados no lambda

Q﻿uando trabalhamos criando módulos compartilhados com diversas outras equipes, é importante que criemos formas de avaliar se as boas práticas estão sendo seguidas, como por exemplo, garantir que as equipes utilizem as runtimes mais atualizadas do lambda.

N﻿esse exemplo vamos criar uma checagem para analisar se a runtime do python que esta sendo utilizada é a mais recente:

```hcl
check "latest_lambda_runtime" {
  assert {
    condition     = contains(["python3.12", "python3.11"], aws_lambda_function.test_lambda.runtime)
    error_message = "Please upgrade from ${aws_lambda_function.test_lambda.runtime} to python3.12 or python3.11"
  }
}
```

O que os usuários irão visualizar no terminal quando executar versões inferiores a 3.11:

```hcl
╷
│ Warning: Check block assertion failed
│
│   on main.tf line 51, in check "latest_lambda_runtime":
│   51:     condition     = contains(["python3.11", "python3.12"], aws_lambda_function.test_lambda.runtime)
│     ├────────────────
│     │ aws_lambda_function.test_lambda.runtime is "python3.9"
│
│ Please upgrade from python3.9 to python3.11 or python3.12
```

### Verificar se as tags são fornecidas para alocação de custos

Quando estamos falando de ambiente corporativo na cloud, temos um trabalho muito forte na visão de custo, principalmente quando a empresa trabalha com centro de custos e equipes possuem budgets próprios para trabalhar com produtos na AWS.

D﻿essa forma, outra forma inteligente de utilizarmos os `checks` é para analisar se as tags adequadas estão sendo utilizadas pelas equipes e evitarmos que recursos sejam criadas da seguinte forma

```hcl
resource "aws_instance" "test" {
  ...
  tags             = { "name" = "test" }
}
```

Podemos utilizar o `assert` com tags especificas presentes no check, podemo implementar utilizando as funções do Terraform `lookup` ou `try` mas vamos utilizar o `can` juntamente ao `&&` para demonstrar que podemos utilizar múltiplas condições.

```hcl
check "cost_centre_tags_on_all_resources" {
  assert {
    condition = (
      can(aws_instance.test.tags_all["squad"]) &&
      can(aws_instance.test.tags_all["cost-center"])
    )
    error_message = "Please add tags for cost allocation. Your tags must include 'cost-center' and 'squad'"
  }
}
```

Utilizando `tags_all` nos capturamos tanto as tags defaults do provider como as tags definidas. Caso os valores não sejam configurado pelo desenvolvedor, teremos um retorno semelhante ao output abaixo:

```hcl
│ Warning: Check block assertion failed
│
│   on main.tf line 68, in check "cost_centre_tags_on_all_resources":
│   68:     condition = (
│   69:       can(aws_instance.test.tags_all["squad"]) &&
│   70:       can(aws_instance.test.tags_all["cost-center"])
│   71:     )
│     ├────────────────
│     │ aws_instance.test.tags_all is map of string with 2 elements
│
│ Please add tags for cost allocation. Your tags must include 'cost-center' and 'squad'
```

C﻿aso configure apenas uma das tags definidas o check irá retornar que apenas um statement `can` foi correto:

```hcl
│ Warning: Check block assertion failed
│
│   on main.tf line 68, in check "cost_centre_tags_on_all_resources":
│   68:     condition = (
│   69:       can(aws_instance.test.tags_all["squad"]) &&
│   70:       can(aws_instance.test.tags_all["cost-center"])
│   71:     )
│     ├────────────────
│     │ aws_instance.test.tags_all is map of string with 2 elements
│     │ aws_instance.test.tags_all["squad"] is "cloud"
│
│ Please add tags for cost allocation. Your tags must include 'cost-center' and 'squad'
```

## O que acontece quando você executa o Terraform Apply

Visto que o `check` apenas emite alertas visuais, ainda temos a possibilidade de apenas ignorá-los e executar o `terraform apply` sem problemas. Porém o intuito desse tipo de condicional é justamente auxiliar no processo de revisão de código e não tornar as regras mandatórias, para isso iremos analisar nas próximas postagens formas alternativas para bloquear a aplicação desse código.

Espero que tenham curtido esse primeiro post de uma serie de três publicações!