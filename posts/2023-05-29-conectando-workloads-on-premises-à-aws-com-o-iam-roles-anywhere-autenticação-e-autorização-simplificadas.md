---
image: /assets/img/AWS.png
title: "Conectando Workloads On-Premises à AWS com o IAM Roles Anywhere:
  Autenticação e Autorização Simplificadas"
description: Como o IAM Roles Anywhere facilita a integração entre workloads
  on-premises e a AWS?
date: 2023-05-28
category: aws
background: "#FF9900"
tags:
  - iam-roles-anywhere
  - integracao
  - workloads-on-premises
  - aws
  - certificados-x509
  - iam-roles
  - seguranca
  - gestao-de-operacoes
  - nuvem
  - conexao-segura
categories:
  - iam-roles-anywhere
  - integracao
  - workloads-on-premises
  - aws
  - certificados-x509
  - iam-roles
  - seguranca
  - gestao-de-operacoes
  - nuvem
  - conexao-segura
---
Nesta postagem do blog, exploraremos como você pode autenticar e autorizar seus workloads usando certificados X.509 e IAM Roles da AWS e como essa solução pode simplificar a integração entre seu ambiente onpremisse.

## Estabelecendo a Infraestrutura de Chave Pública

Antes de tudo, configurar uma infraestrutura de chave pública (PKI) é essencial. Saiba como criar uma autoridade de certificação (CA) confiável que emitirá certificados X.509 para seus workloads on-premises.

## Registre a CA como Trust Anchor no IAM Roles Anywhere

Agora é hora de estabelecer a confiança entre sua conta da AWS e a CA. Aprenda como registrar sua CA como um trust anchor no IAM Roles Anywhere, permitindo que o sistema valide os certificados emitidos pela sua CA.

## Autenticação e Autorização

Entenda o processo de autenticação e autorização usando o IAM Roles Anywhere. Descubra como sua aplicação on-premises pode enviar uma solicitação de autenticação, incluindo o certificado X.509 com a chave pública e a assinatura correspondente. Saiba como o IAM Roles Anywhere valida a solicitação e cria uma nova sessão de Role associada à Role especificada.

## Permissões e Políticas

Explore as permissões efetivas da sessão de Role e como elas são determinadas pela interseção das identity-based policies da Role de destino e das session policies configuradas no perfil do IAM Roles Anywhere. Aprenda também sobre outras políticas que podem afetar as permissões, como permission boundaries e service control policies (SCPs).

## Conclusão

A integração entre workloads on-premises e a AWS é simplificada com o IAM Roles Anywhere. Ao utilizar certificados X.509 e IAM Roles, você pode estabelecer uma comunicação segura e confiável, permitindo que seus workloads aproveitem os recursos e serviços da AWS. Simplifique a autenticação e autorização em seus ambientes híbridos e potencialize sua capacidade de gerenciar e proteger suas operações em nuvem. Experimente o IAM Roles Anywhere e desfrute de uma integração eficiente e segura entre seus workloads on-premises e a AWS.