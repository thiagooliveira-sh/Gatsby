---
image: /assets/img/AWS.png
title: Forcar a configuracao de MFA para login no console da AWS
description: Todos nós sabemos que a configuração de uma camada extra de
  segurança é sempre bem-vinda, sabendo disso vamos aprender uma forma de forçar
  com que os usuários com acesso ao console só possam realizar essas ações se
  possuirem o MFA habilitado.
date: 2021-09-10
category: aws
background: "#FF9900"
tags:
  - AWS
  - MFA
  - segurança
  - console
  - IAM
categories:
  - AWS
  - MFA
  - segurança
  - console
  - IAM
---
Você pode permitir que seus usuários gerenciem os próprios dispositivos e credenciais de autenticação multifator (MFA) porem como garantiremos que eles realizem a configuração para poder começar a utilizar o console de gerenciamento ?

Em alguns ambientes nao podemos perder tempo para ficar indo pessoa por pessoa e solicitando que encarecidamente o individuo realize a configuração do MFA na sua conta, dessa forma vamos aprender como forçar com que qualquer ação dentro do console só seja possível se o usuário possuir o MFA configurado em sua conta. 

### 1: Criar uma política para impor a utilização do MFA

1. Faça login no Console de Gerenciamento da AWS como um usuário com credenciais de administrador.
2. Abra o console do IAM.
3. No painel de navegação, escolha Políticas e, em seguida, Criar política.
4. Selecione a opção JSON e insira o conteúdo abaixo.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowViewAccountInfo",
            "Effect": "Allow",
            "Action": [
                "iam:GetAccountPasswordPolicy",
                "iam:ListVirtualMFADevices"
            ],
            "Resource": "*"
        },
        {
            "Sid": "AllowManageOwnPasswords",
            "Effect": "Allow",
            "Action": [
                "iam:ChangePassword",
                "iam:GetUser"
            ],
            "Resource": "arn:aws:iam::*:user/${aws:username}"
        },
        {
            "Sid": "AllowManageOwnAccessKeys",
            "Effect": "Allow",
            "Action": [
                "iam:CreateAccessKey",
                "iam:DeleteAccessKey",
                "iam:ListAccessKeys",
                "iam:UpdateAccessKey"
            ],
            "Resource": "arn:aws:iam::*:user/${aws:username}"
        },
        {
            "Sid": "AllowManageOwnVirtualMFADevice",
            "Effect": "Allow",
            "Action": [
                "iam:CreateVirtualMFADevice"
            ],
            "Resource": "arn:aws:iam::*:mfa/${aws:username}"
        },
        {
            "Sid": "AllowManageOwnUserMFA",
            "Effect": "Allow",
            "Action": [
                "iam:EnableMFADevice",
                "iam:ListMFADevices",
                "iam:ResyncMFADevice"
            ],
            "Resource": "arn:aws:iam::*:user/${aws:username}"
        },
        {
            "Sid": "DenyAllExceptListedIfNoMFA",
            "Effect": "Deny",
            "NotAction": [
                "iam:CreateVirtualMFADevice",
                "iam:EnableMFADevice",
                "iam:GetUser",
                "iam:ListMFADevices",
                "iam:ListVirtualMFADevices",
                "iam:ResyncMFADevice",
                "sts:GetSessionToken"
            ],
            "Resource": "*",
            "Condition": {
                "BoolIfExists": {
                    "aws:MultiFactorAuthPresent": "false"
                }
            }
        }
    ]
}
```

O que essa política faz?

A instrução `AllowViewAccountInfo` permite que o usuário visualize informações no nível da conta como visualizar os requisitos de senha e visualizar os dispositivos MFA.

A instrução `AllowManageOwnAccessKeys` permite que o usuário crie, atualize e exclua as próprias chaves de acesso.

A instrução `AllowManageOwnVirtualMFADevice` permite que o usuário crie e atualize o próprio dispositivo MFA virtual.

A instrução `DenyAllExceptListedIfNoMFA` nega acesso a todas as ações em todos os serviços da AWS, exceto algumas ações listadas, mas somente se o usuário não estiver conectado com MFA. 

### 2: anexar políticas ao grupo

Anexe a política nos grupos da sua conta no qual os usuarios que acessam o console estao inserido.

### 3: Testar o acesso do usuário

Crie um usuário novo sem nenhuma configuração de MFA, apenas para teste, inserindo no grupo utilizado na Etapa 2. Feito isso basta realizar login e observar que o mesmo não tera permissão para nada além da alteração de MFA, observe:

![console](/assets/img/console.png)

Pronto, basta inserir os seus usuários no grupo de acesso, ou criar um grupo padrão cujo os usuários devem ser adicionados sempre que for utilizar o console da Amazon. Dessa forma não precisamos nos preocupar pois através do console não será possível realizar nenhuma intervenção sem que exista uma configuração de MFA.

Espero que tenham gostado!