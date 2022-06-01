---
image: /assets/img/AWS.png
title: Configurando EKS para usar AWS Load Balancer Controller
description: O Load Balancer Controller gerencia os Elastic Load Balancers
  fornecendo Application e Network Load Balancer para um cluster do Kubernetes.
date: 2022-06-01
category: aws
background: "#FF9900"
tags:
  - aws
  - alb
  - nlb
  - eks
  - devops
  - k8s
categories:
  - aws
  - alb
  - nlb
  - eks
  - devops
  - k8s
---
Como já sabemos, o AWS Load Balancer Controler é uma forma de entregarmos acesso a nossos pods através de uma Load Balancer dentro da AWS, seja ela Application ou Network. Nesse artigo estaremos utilizando o EKS no qual o cluster deve ter sua versão 1.19 ou posterior. A criação do cluster não será abordada, então partiremos direto para o que interessa que é a configuração do Controler.

