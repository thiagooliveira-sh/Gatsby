---
image: /assets/img/AWS.png
title: Construindo IAM Least Privilege
description: Em ambientes AWS, dar permissões de Admin para todos pode até ser
  rápido, mas é como entregar a chave-mestra de um prédio para qualquer
  visitante, cedo ou tarde, algo errado vai acontecer. A prática de Least
  Privilege garante que cada usuário ou aplicação tenha apenas as permissões
  necessárias para realizar suas funções, reduzindo riscos e aumentando a
  segurança.
date: 2025-08-11
category: aws
background: "#FF9900"
tags:
  - IAM
  - AWSPERMISSIONS
  - LEASTPRIVILEGE
  - AWSIAM
  - TAGBASEDPOLICY
  - SECURITYBESTPRACTICES
  - ACCESSCONTROL
  - DEVSECOPS
  - AWSCLI
  - EC2
  - AWSPOLICIES
categories:
  - IAM
  - AWSPERMISSIONS
  - LEASTPRIVILEGE
  - AWSIAM
  - TAGBASEDPOLICY
  - SECURITYBESTPRACTICES
  - ACCESSCONTROL
  - DEVSECOPS
  - AWSCLI
  - EC2
  - AWSPOLICIES
---
Neste artigo, vamos sair do cenário de permissões amplas e criar políticas restritivas reais, utilizando **tag-based policies** para controlar quem pode criar ou excluir instâncias EC2 com base na tag `squad`. 

### **O problema das permissões amplas**

Quando um desenvolvedor ou aplicação recebe uma **policy `AdministratorAccess`**, está recebendo **todas as ações em todos os serviços AWS**.\
Isso traz riscos claros:

* **Erro humano**: um simples comando errado pode apagar recursos críticos.
* **Ataques internos**: um funcionário mal-intencionado pode explorar privilégios para acessar dados sensíveis.
* **Compliance**: permissões amplas violam normas como ISO 27001, SOC 2, PCI-DSS.

Na prática, o maior número de incidentes de segurança não vem de ataques externos, mas sim de excessos de permissão combinados com erros ou descuidos.

## **O que é Least Privilege**

O Least Privilege, ou Princípio do Menor Privilégio, é um conceito de segurança que pode ser explicado em termos bem simples:

> *Dê a cada pessoa ou sistema apenas as chaves que eles realmente precisam, nada além disso.*

Imagine que você trabalha em um prédio corporativo com 20 andares.

* Você trabalha no **andar 5**.
* Para realizar seu trabalho, só precisa acessar o **andar 5** e a **sala de reuniões no andar 3**.
* No entanto, se a empresa te dá **um crachá que abre todos os andares**, você pode, por acidente ou intenção, acessar lugares onde não deveria estar, como o cofre no subsolo ou uma sala restrita no 18º andar.

Na nuvem, é a mesma coisa**,** um usuário, função ou aplicação só deveria ter acesso ao “andar” (ou serviço, ou recurso) que precisa usar. 

Dar acesso de **Administrador** para todo mundo é como distribuir o crachá-mestre para qualquer visitante: é prático no curto prazo, mas perigoso e caro no longo prazo.



### **Por que isso é tão importante na AWS?**

Na AWS (e em qualquer nuvem), permissões são extremamente granulares. Essa flexibilidade é um dos grandes diferenciais da nuvem, mas também é um dos maiores riscos quando se fala em permissões.

Diferente de um servidor físico no seu data center, que pode estar isolado por uma rede interna, na AWS cada API e serviço pode ser acessado de qualquer lugar do mundo se houver credenciais válidas.

Isso significa que:

* Um **erro de configuração** ou **excesso de permissão** pode causar um impacto **global** e **imediato**.
* Recursos e dados críticos podem ser alterados ou expostos **em segundos**.
* Os custos podem disparar com a criação acidental ou mal-intencionada de recursos caros (GPU, storage, instâncias grandes).

Por isso, o **Least Privilege** é tão importante na AWS, ele reduz a superfície de ataque, limita o impacto de credenciais comprometidas e impede ações não autorizadas mesmo dentro da própria equipe.



### **Cenários reais onde o Least Privilege faz diferença**

##### **1. Exclusão acidental de recursos críticos**

Imagine que um desenvolvedor precise criar instâncias EC2 para testes.\
Se ele tiver a permissão `AdministratorAccess`, ele também pode **apagar instâncias de produção** sem querer basta errar um ID ou rodar um script no ambiente errado.

* **Como o Least Privilege resolve:** Permitir apenas `ec2:RunInstances` e `ec2:TerminateInstances` para recursos com uma tag específica (ex.: `environment=dev`). Assim, mesmo que o comando seja executado com o ID errado, a AWS negará a ação.

##### **2. Aumento inesperado de custos**

Um analista de dados recebe acesso ao serviço SageMaker para rodar experimentos.\
Se ele tiver permissão ampla (`sagemaker:*`), pode acidentalmente criar instâncias p3.16xlarge (com GPU de alto desempenho) que custam **mais de US$ 30/hora**.

* **Como o Least Privilege resolve:** Restringir as instâncias permitidas a tipos e tamanhos específicos, além de aplicar limite de regiões.

##### **3. Ambiente multi-squad com governança fraca**

Sem restrição, a squad “SRE” pode apagar recursos da squad “Cloud” e vice-versa, gerando conflitos internos e risco operacional.

* **Como o Least Privilege resolve:** Usar **tag-based policies** para garantir que cada squad só gerencie recursos que tenham a tag correspondente ao seu time (`squad=cloud`, `squad=sre`, etc.).

#### **4. Vazamento de dados sensíveis**

Um engenheiro precisa acessar logs de uma aplicação no CloudWatch, mas com permissões amplas (`logs:*`) também consegue ler logs de outros sistemas que contêm dados sensíveis de clientes.

* **Como o Least Privilege resolve:** Permitir apenas acesso a grupos de logs específicos e negar explicitamente logs que contenham dados de compliance (ex.: PCI, HIPAA).

#### **5. Criação de recursos em regiões não autorizadas**

Um time cria recursos apenas na região `us-east-1`, mas um desenvolvedor com permissão ampla pode criar acidentalmente recursos em `ap-southeast-1`.\
Isso não só aumenta o custo, mas também **dificulta auditoria e resposta a incidentes**.

* **Como o Least Privilege resolve:** Restringir criação (`RunInstances`, `CreateBucket`, etc.) apenas para regiões aprovadas via `Condition` com `aws:RequestedRegion`.



### **Evaluation Strategy da AWS**

A AWS decide se permite ou não uma ação seguindo esta ordem:

1. **Explicit Deny**: Se houver negação explícita, o acesso é bloqueado.
2. **Explicit Allow**: Se não houver deny e houver allow explícito, o acesso é concedido.
3. **Default Deny**: Se nenhuma policy permitir, o acesso é negado.

Nas **tag-based policies**, o `Condition` é avaliado antes de conceder o `Allow`. Se não for atendido, o acesso é negado, mesmo com a ação listada.



## **Hands-on:** 

#### **Pré-requisitos**

* AWS CLI configurado
* Permissão para criar policies e roles
* Duas instâncias EC2 (uma com tag `squad=cloud`, outra com tag diferente)

### **1. Criando a policy permissiva**

Permite criar e deletar qualquer EC2:

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:RunInstances",
        "ec2:TerminateInstances"
      ],
      "Resource": "*"
    }
  ]
}

```

### **2. Criando a policy mínima (tag-based)**

Permite criar apenas instâncias com `squad=cloud` e deletar apenas instâncias que tenham essa tag.

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowRunInstancesWithSquadTag",
      "Effect": "Allow",
      "Action": "ec2:RunInstances",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestTag/squad": "cloud"
        }
      }
    },
    {
      "Sid": "AllowTerminateInstancesWithSquadTag",
      "Effect": "Allow",
      "Action": "ec2:TerminateInstances",
      "Resource": "arn:aws:ec2:*:*:instance/*",
      "Condition": {
        "StringEquals": {
          "ec2:ResourceTag/squad": "cloud"
        }
      }
    }
  ]
}
```



### **3. Testando**

1. Criar instância sem tag `squad=cloud` → **AccessDenied**.
2. Criar instância com tag correta → **Permitido**.
3. Tentar deletar instância sem a tag → **AccessDenied**.
4. Deletar instância com tag correta → **Permitido**.



## **Erros comuns e soluções**

* **Falta de tag na criação**: Use `aws:RequestTag` para forçar envio da tag.
* **Confundir `RequestTag` com `ResourceTag`**: o primeiro é na criação, o segundo para recursos já existentes.
* **`Resource` amplo sem `Condition`**: sempre restringir.
* **Achar que IAM substitui SCP**: SCP é para restrições organizacionais, IAM é granular no nível de conta.



Migrar do acesso Admin para políticas mínimas é fundamental para segurança na AWS.\
O uso de **tag-based policies** é uma forma prática de aplicar controle granular, alinhando segurança e agilidade.

\
Ao entender a **evaluation strategy** e cenários reais de risco, você implementa proteção que realmente funciona no dia a dia. Os próximos passos é expandir a mesma lógica para S3, RDS, Lambda, integrar a criação das politicas em ferramentas de IaC e periodicamente monitorar os acessos atravsé do IAM Access Analyzer.