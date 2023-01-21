---
image: /assets/img/AWS.png
title: Criação de permissões granulares do IAM para Pods
description: Se você está trabalhando com o EKS, provavelmente já ouviu falar de
  OIDC. Mas o que é esse recurso e como ele funciona?
date: 2023-01-15
category: aws
background: "#FF9900"
tags:
  - aws
  - k8s
  - oidc
  - iam
  - eks
categories:
  - aws
  - k8s
  - oidc
  - iam
  - eks
---
O OIDC é uma forma de autenticação que usa tokens para garantir que somente as pessoas certas tenham acesso ao seu cluster EKS e às ações que podem realizar nele. Ele é configurado usando o EKS e o IAM da AWS. Em resumo, ele funciona como uma porta de entrada para garantir a segurança do seu cluster EKS.

Partindo do pressuposto de que estamos dando continuidade ao artigo [criação de cluster EKS](https://thiagoalexandria.com.br/criando-um-cluster-no-amazon-eks/) vamos então criar um laboratório com uma aplicação que terá permissão para acessar o S3, então antes de seguir vamos abordar os seguintes pontos:

* Criação do IAM Identity Providers
* IAM Policies e Role
* Bucket S3
* Sample App

Criação do IAM Identity Provider

Por padrão o nosso Cluster ja entrega um endpoint criado para o OIDC, o que precisamos fazer é criar um IAM Identity Provider, o processo pode ser feito utilizando o console da AWS através do painel IAM na opção Identity providers mas nesse laboratório vamos simplificar a criação utilizando o `eksctl`. O `eksctl` é uma ferramenta da AWS que facilita a criação e gerenciamento de clusters no EKS (Amazon Elastic Kubernetes Service). Ele te permite fazer tarefas comuns como criar clusters, escalonar nós e gerenciar configurações de segurança de forma fácil e rápida.

Para instalar o utilitário de linha de comando, siga os passos abaixo baseado no seu sistema operacional Linux e macOS:

```
#Mac
brew upgrade eksctl && { brew link --overwrite eksctl; } || { brew tap weaveworks/tap; brew install weaveworks/tap/eksctl; }

#Linux
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```

Agora que tudo está instalado, vamos criar nosso provedor de identidade para o OIDC. Para isso, basta usar o seguinte comando:

```
eksctl utils associate-iam-oidc-provider --cluster my-eks-lab-cluster --approve
```

Vamos acessar o console AWS para confirmar a criação:

![iam-idenity](/assets/img/iam-idenity.png)

I﻿AM Policies e Roles

Agora que temos o provedor de identidade podemos criar as nossas IAM Policies e Roles para que a nossa futura aplicação consiga utiliza-las. Para isso precisamos saber o url do nosso OIDC e para descobrir basta executar o seguinte comando:

```
aws eks describe-cluster --name my-eks-lab-cluster --query "cluster.identity.oidc.issuer"  --output text | cut -d '/' -f 5
```

Teremos um retorno semelhante a imagem abaixo:

![describe-cluster-oidc](/assets/img/describe-cluster-oidc.png)

Primeiro, vamos criar uma Role adicionando uma relação de confiança através do trust relationships. Para criar a função, vamos considerar que vamos usar a namespace "eks-s3-example" e a service account que terá permissão para acessar a função será "eks-s3-example-iam-role-sa". Lembre-se de substituir <AWS-ACCOUNT>, <AWS-REGION> e <OIDC-ID> pelos dados da sua conta AWS e o id do OIDC obtido no passo anterior dai execute o seguinte comando para criar um arquivo JSON de política de confiança do IAM:

```
cat << EOF > SampleAppS3AccessroleAssumeRole.json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Federated": "arn:aws:iam::<AWS-ACCOUNT>:oidc-provider/oidc.eks.<AWS-REGION>.amazonaws.com/id/<OIDC-ID>”
            },
            "Action": "sts:AssumeRoleWithWebIdentity",
            "Condition": {
                "StringEquals": {
                    "oidc.eks.<AWS-REGION>.amazonaws.com/id/<OIDC-ID>:aud": "sts.amazonaws.com",
                    "oidc.eks.<AWS-REGION>.amazonaws.com/id/<OIDC-ID>:sub": "system:serviceaccount:eks-s3-example:eks-s3-example-iam-role-sa"
                }
            }
        }
    ]
}
EOF
```

Com o arquivo JSON criado, vamos agora criar a função de permissão (Role) usando o AWS CLI.

```
aws iam create-role \
  --role-name SampleAppS3Accessrole \
  --assume-role-policy-document file://"SampleAppS3AccessroleAssumeRole.json"
```

Com a função criada, vamos anexar a política que determinará quais permissões a aplicação poderá assumir.

```
aws iam attach-role-policy \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess \
  --role-name SampleAppS3Accessrole
```

Bucket S3

Para o laboratório, vamos precisar criar um bucket s3, esse processo pode ser executado através do console da AWS ou utilizando o CLI através do seguinte comando, lembre-se que o nome do bucket precisa ser único de forma global, então insira um nome personalizado:

```
aws s3api create-bucket \
    --bucket eks-s3-example-app-bucket \
    --region us-east-1
```

Sample App

Bom, nessa altura do campeonato devemos estar com tudo criado, para realizar um teste vamos criar manifesto do tipo job, para tudo funcionar da forma que esperamos precisamos criar a namespace:

```
kubectl create namespace eks-s3-example
```

Para criamos o service account, rode o comando abaixo na sua máquina para criar o arquivo de manifesto, mais uma vez, lembra-se de alterar o `<AWS-ACCOUNT>` pelo id da sua conta:

```
cat << EOF > eks-s3-service-account.yaml
apiVersion: v1
automountServiceAccountToken: true
kind: ServiceAccount
metadata:
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<AWS-ACCOUNT>:role/SampleAppS3Accessrole
  labels:
    env: dev
    app: eks-s3-example
  name: eks-s3-example-iam-role-sa
  namespace: eks-s3-example
EOF
```

Basta então criarmos o nosso `Job` seguindo o seguinte manifesto, lembre se alterar o `<BUCKET-NAME>` pelo nome do seu bucket criado anteriormente:

```
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

Para termos uma visão melhor da execução, adicionei um arquivo chamado `aws.png` no bucket e então o resultado da listagem do bucket deve ser semelhante ao abaixo:

![eks-s3-example](/assets/img/eks-s3-example.png)

Espero que tenham compreendido bem como funciona a atribuição de IAM para os pods utilizando o OIDC atacado ao IAM Identity provider, em nosso próximo lab vamos criar o ALB ingress controller!