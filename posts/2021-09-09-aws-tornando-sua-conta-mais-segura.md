---
image: /assets/img/AWS.png
title: AWS Tornando sua conta mais segura
description: Já estamos cansados de saber que precisamos utilizar senhas fortes,
  não compartilhar acesso más você sabia que existem outras formas de assegurar
  seus projetos e evitar que fiquemos vulneráveis?
date: 2021-09-09
category: aws
background: "#FF9900"
tags:
  - AWS
  - segurança
  - sec
  - cloud
  - ec2
  - s3
  - cloudfront
  - waf
  - iam
categories:
  - AWS
  - segurança
  - sec
  - cloud
  - ec2
  - s3
  - cloudfront
  - waf
  - iam
---
### IAM 
   * Politica de senha forte
   * Todos precisam de MFA
   * Minima permissao possível
   * Rotacionar secrets periodicamente
   * MFA para terminate/reboot instance

### EC2
   * EBS encriptada por default
   * SG limitado
   * Cuidado com metadatas

### S3
   * Forçe a utilizaçao do endpoint por HTTPS
   * Criptografia at rest e versionamento

### KMS
   * Politica de rotacionamento de chaves

### WAF
   * Habilite o WAF para os seus workloads