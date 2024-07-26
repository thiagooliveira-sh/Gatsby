---
image: /assets/img/HashiCorp-Terraform-logo.png
title: Terraform condicoes customizadas - Parte 2
description: O Terraform possui diversas alternativas para validar variáveis e
  configurações dentro do seu código. Essas validações ajudam a evitar erros e
  seguir boas práticas, assegurando que a infraestrutura seja robusta e
  confiável.
date: 2024-07-26
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
Conforme introduzido na primeira parte dessa publicação. Ao utilizar Terraform para provisionar infraestrutura, é crucial implementar condições customizadas para garantir a integridade e a eficácia da configuração. 

V﻿amos falar nessa publicação sobre condições de validações, a forma mais comum referente a essa configuração é a validação de variáveis ​​no Terraform.

### O que são Variáveis de Entrada no Terraform?

Antes de entrar nos exemplos práticos, vamos revisar rapidamente o que são variáveis de entrada. No Terraform, variáveis de entrada permitem que você torne seus módulos mais dinâmicos e reutilizáveis, aceitando diferentes valores conforme necessário.

### Por que validar suas variáveis?

Isso é super importante para garantir que as configurações do seu código estejam corretas antes de serem aplicadas, evitando surpresas desagradáveis como:

* Evitar erros de configuração.﻿
* Garantir que os valores passados estejam dentro de um intervalo aceitável.
* Criar guard rails para boas práticas.
* Melhorar a segurança e robustez dos seus scripts.

Além disso, sem validação, a mensagem de erro exibida ao usuário quando uma variável inválida é passada vem diretamente da API da AWS, que às vezes pode ser difícil de ler e pode não informar exatamente o que esta errado. Com a validação no Terraform, você pode especificar a mensagem de erro.

### Exemplo 1: Convenção de nome

U﻿m ótimo exemplo para validação de nomes é garantir que uma variável segue a convenção de nome determinada na empresa, vamos supor que queremos garantir que o padrão seja `<environemnt>-<nome>-<digito>` como por exemplo `dev-ambiente-1` podemos criar uma validação para a variável da seguinte forma:

```hcl
variable "name" {
  description = "Nome que segue a convenção 'env-palavra-dígito(s)'"
  type        = string

  validation {
    condition     = can(regex("^(dev|hml|prd)-([a-z]+)-([0-9]+)$", var.name))
    error_message = "O nome deve seguir a convenção 'env-palavra-dígito(s)'. Exemplos: 'dev-redis-1', 'prd-smtp-0', 'hml-docker-4'." 
  }
}
```

Agora, suponha que você forneça um valor inválido para a variável name, como `test-algumacoisa-5`. O output de erro no terminal ficaria assim:

```hcl
╷
│ Error: Invalid value for variable
│   on main.tf line 3, in variable "name":
│    3: variable "name" {
│     ├────────────────
│     │ var.name is "test-algumacoisa-5"
│ 
│ O nome deve seguir a convenção 'env-palavra-dígito(s)'. Exemplos: 'dev-redis-1', 'prd-smtp-0', 'hml-docker-4'.
╵
```

### Exemplo 2: Validando quantas instâncias serão criadas

Essa validação pode ser interessante para bloquearmos que seja criadas mais máquinas do que o permitido para determinados ambientes, por exemplo, temos um módulo para criação de EC2, nesse módulo temos uma variável chamada instance_count que o usuário informa quantas máquinas serão criadas.

O﻿ intuito é criar um guard rail para que não sejam criadas quantidades desproporcionais ao permitido pela equipe:

```hcl
variable "instance_count" {
  description = "Número de instâncias"
  type        = number

  validation {
    condition     = var.instance_count >= 1 && var.instance_count <= 3
    error_message = "O número de instâncias deve estar entre 1 e 3."
  }
}
```

A﻿gora se você estiver desenvolvendo e tentar criar mais do que 3 instâncias será retornado o seguinte erro para o usuário:

```hcl
╷
│ Error: Invalid value for variable
│   on main.tf line 3, in variable "instance_count":
│    3: variable "instance_count" {
│     ├────────────────
│     │ var.instance_count is 4
│ 
│ O número de instâncias deve estar entre 1 e 3.
╵
```

### Exemplo 3: Padrão de tags

Atualmente na cloud tudo gira em torno de Finops, garantir a consistência e conformidade das tags aplicadas aos recursos é fundamental para uma boa gestão e organização.

D﻿essa forma vamos montar uma checagem para garantir que os padrões serão utilizados:

```hcl
variable "tags" {
  description = "Mapeamento das tags a serem aplicadas aos recursos"
  type        = map(string)

  validation {
    condition = (
      contains(keys(var.tags), "cost-center") &&
      contains(["core", "business", "marketing"], var.tags["cost-center"])
    )
    error_message = "As tags obrigatórias são 'cost-center'. que deve possuir os seguintes values 'core', 'business' ou 'marketing'."
  }
}
```

D﻿essa forma se eu informar qualquer valor diferente dos que estão sendo esperado teremos o seguinte erro:

```hcl
│ 
│   Error: Invalid value for variable
│   on main.tf line 3, in variable "tags": {
│     ├────────────────
│     │ var.tags is map of string with 1 element
│     │ var.tags["cost-center"] is "dummy"
│ 
│ As tags obrigatórias são 'cost-center'. que deve possuir os seguintes values 'core', 'business' ou 'marketing'.
```

### Encerramento

Esperamos que este post tenha sido útil e que os exemplos apresentados possam servir de insight para implementação de vocês. No proximo post vamos falar sobre preconditions e postconditions, até a próxima!