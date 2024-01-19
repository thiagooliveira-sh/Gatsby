---
image: /assets/img/AWS.png
title: EKS Pod Identity simplificando entrega de identidades IAM para aplicações
description: Em 2019, a introdução do IAM Roles for Service Accounts
  revolucionou a gestão de permissões no Kubernetes, permitindo a associação de
  funções IAM a contas de serviço.
date: 2024-01-16
category: aws
background: "#FF9900"
tags:
  - AWS
  - IAM
  - EKS
  - K8S
  - SEC
categories:
  - AWS
  - IAM
  - EKS
  - K8S
  - SEC
---
Essa abordagem propiciou a implementação do princípio de "last privilege", concedendo aos pods apenas as permissões estritamente necessárias. Essa prática capacitou os desenvolvedores a configurar suas aplicações com permissões detalhadas, alinhadas ao conceito de "least privilege". 

No ultimo AWS re:invent, em 2023, surge o EKS Pod Identity, um recurso AWS que promete aprimorar ainda mais a segurança e a eficiência na gestão de identidade em ambientes Kubernetes. Este artigo explora os alicerces e benefícios do EKS Pod Identity, delineando seu papel crucial no avanço da segurança e na simplificação do desenvolvimento de aplicações em contêineres.

### Desafios de identity em ambientes Kubernetes

Lidar com identidade em ambientes Kubernetes pode ser um verdadeiro quebra-cabeça. A coisa toda de dar as permissões certas para os contêineres fazerem o que precisam sem dar carta branca é tipo andar na corda bamba. Antigamente, conectar identidades Kubernetes a sistemas externos, como IAM na nuvem, era meio como misturar água e óleo. Uma bagunça! Ficar mexendo manualmente com credenciais e não ter uma solução única era garantia de dor de cabeça e riscos de segurança. 

É nesse cenário que entra o EKS Pod Identity, lançado como uma espécie de evolução turbo do IAM Roles for Service Accounts (IRSA), o EKS Pod Identity surge para dar um upgrade no jogo da identidade em ambientes Kubernetes. Se em tempos passados, o IRSA já trazia o poder de associar funções IAM a contas de serviço, agora, com o Pod Identity, a coisa fica ainda mais interessante. Imagina uma versão 2.0 que facilita ainda mais a vida dos desenvolvedores e aprimora a segurança nos clusters. O Pod Identity dá um passo à frente, simplificando a associação de identidades AWS diretamente aos pods em execução no Kubernetes.

E﻿ é isso que vamos aprender a fazer hoje, como o EKS Pod Identity funciona, como podemos configurar no nosso cluster e os principais pontos comparado com o IRSA.

### Pontos importantes antes de começar

**O Pod Identity não acarreta custos adicionais para o seu ambiente EKS. Essa funcionalidade está disponível a partir da versão 1.24, sendo essencial que suas aplicações estejam utilizando as versões mais recentes de seus respectivos SDKs para assegurar plena compatibilidade.**

### Habilitando o Pod Identity 

Para começar a usar o Pod Identity, ao contrário do IRSA, é necessário instalar um plugin no nosso cluster. Basta acessar o seu cluster EKS, escolher a opção "Add-ons" e selecionar "Get mode add-ons" e procure pelo EKS Pod Identity Agent.

![](/assets/img/pod-identity-1.png)

Para iniciar o uso do EKS Pod Identity, simplesmente siga as etapas do wizard e escolha a versão mais recente disponível. Com o plugin instalado, vamos agora configurar uma aplicação simples que já utilizamos como [exemplo](https://thiagoalexandria.com.br/criacao-de-permissoes-granulares-do-iam-para-pods/) em artigos anteriores, envolvendo acesso a um bucket S3. Nosso próximo passo é entender as mudanças na política do IAM.

### Criação de Policy e Roles

Primeiro, vamos criar uma Role adicionando uma relação de confiança através do trust relationships, para criar a função, vamos considerar que vamos usar a namespace "eks-s3-example" e a service account que terá permissão para acessar a função será "eks-s3-example-iam-role-sa".

P﻿ara que a configuração possa surtir efeito, precisamos configurar a trust relationship utilizando como "principal" o `pods.eks.amazonaws.com`:

```
cat << EOF > SampleAppS3AccessroleAssumeRole.json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "pods.eks.amazonaws.com"
            },
            "Action": [
                "sts:AssumeRole",
                "sts:TagSession"
            ]
        }
    ]
}
```

Com o arquivo JSON criado, vamos agora criar a função de permissão (Role) usando o AWS CLI.

```
aws iam create-role \
  --role-name SampleAppS3Accessrole \
  --assume-role-policy-document file://"SampleAppS3AccessroleAssumeRole.json"
```

Com a função criada, vamos anexar a política que determinará quais permissões a aplicação poderá assumir, foi utilizado a politica de Full Access apenas para laboratório:

```
aws iam attach-role-policy \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess \
  --role-name SampleAppS3Accessrole
```

# Bucket S3

Para o laboratório, vamos precisar criar um bucket s3, esse processo pode ser executado através do console da AWS ou utilizando o CLI através do seguinte comando, lembre-se que o nome do bucket precisa ser único de forma global, então insira um nome personalizado:

```text
aws s3api create-bucket \
    --bucket eks-s3-example-app-bucket \
    --region us-east-1
```

### S﻿ample App

Bom, nessa altura do campeonato devemos estar com tudo criado, para realizar um teste vamos criar manifesto do tipo job, para tudo funcionar da forma que esperamos precisamos criar a namespace:

```
kubectl create namespace eks-s3-example
```

Para criamos o service account, rode o comando abaixo na sua máquina para criar o arquivo de manifesto, mais uma vez

```
cat << EOF > eks-s3-service-account.yaml
apiVersion: v1
automountServiceAccountToken: true
kind: ServiceAccount
metadata:
  labels:
    env: dev
    app: eks-s3-example
  name: eks-s3-example-iam-role-sa
  namespace: eks-s3-example
EOF

```

Basta então criarmos o nosso `Job` seguindo o seguinte manifesto, lembre se alterar o `<BUCKET-NAME>` pelo nome do seu bucket criado anteriormente:

```text
cat << EOF > eks-s3-job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: eks-s3-example 
  namespace: eks-s3-example
spec:
  template:
    metadata:
      labels:
        app: eks-s3-example
    spec:
      serviceAccountName: eks-s3-example-iam-role-sa
      containers:
      - name: eks-s3-test
        image: amazon/aws-cli:latest
        args: \["s3", "ls”, "s3://<BUCKET-NAME>"]
      restartPolicy: Never
EOF
```

Execute então o comando` kubectl create -f <NOME-DOS-ARQUIVOS> `para criar os recursos no seu cluster EKS.

### Atribuindo identidade

É preciso que agora naveguemos até a guia Access no nosso cluster EKS. Na seção Pod Identity associations, selecionamos a opção Create Pod Identity association para mapear minha função IAM aos pods do Kubernetes.

![](/assets/img/pod-identity-2.png)

S﻿elecione as opções referente a role, namespace e service account e finalize a associação:

![](/assets/img/pod-identity-3.png)

Para termos uma visão melhor da execução, adicionei um arquivo chamado `aws.png` no bucket e então o resultado da listagem do bucket deve ser semelhante ao abaixo:

![](/assets/img/pod-identity-4.png)

### Considerações

Este é o mais recente plugin que chega para revolucionar a maneira como as identidades IAM são entregues para as aplicações dentro do EKS, simplificando o processo de criação e associação de identidades para o ambiente EKS.

M﻿ostra ser uma ótima alternativas ao invés das complexas `trust relationship` que precisávamos configurar anteriormente utilizando o IRSA, gostei muito da integração e facilidade gráfica de se realizar as mudanças e atribuições de permissões, espero que logo mais tenhamos essa funcionalidade para ferramentas de IaC uma vez que até a data de hoje não  identifiquei nada relacionado nas documentações do Terraform.