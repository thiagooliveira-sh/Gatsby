---
image: /assets/img/AWS.png
title: EKS com ALB controller
description: O ALB é um serviço de balanceamento de carga de aplicativos
  oferecido pela AWS. Ele distribui o tráfego de entrada de forma inteligente
  entre as instâncias de back-end de sua aplicação, com base nas regras que você
  configura. Isso permite que você aproveite automaticamente a escalabilidade e
  a disponibilidade de sua aplicação.
date: 2023-01-27
category: aws
background: "#FF9900"
tags:
  - aws
  - alb
  - k8s
  - ingress
categories:
  - aws
  - alb
  - k8s
  - ingress
---
O ALB controller é um controlador Kubernetes que permite gerenciar seus ALBs do Kubernetes. Ele permite que você crie, configure e gerencie ALBs e suas regras de roteamento diretamente a partir de suas definições de ingress no Kubernetes.

Para alcançarmos o objetivo final do laboratório, é crucial que tenhamos seguido os passos descritos nos artigos recentes, onde configuramos o cluster e criamos o provedor de identidade IAM, são eles o [Criando um cluster](https://thiagoalexandria.com.br/criando-um-cluster-no-amazon-eks/)  e [Permissões granulares](https://thiagoalexandria.com.br/criacao-de-permissoes-granulares-do-iam-para-pods/). Sabendo disso vamos então passar pelos seguintes pontos para conseguirmos configurar o controller:

* Instalação do Helm
* Criação de IAM Roles
* Install ALB Controller
* Criação de um ingress para sample app

# Instalação do Helm

Helm é uma ferramenta que facilita a instalação, gerenciamento e configuração de aplicativos em clusters Kubernetes através de pacotes chamados `charts`,  além de permitir a criação de templates para configuração de recursos do k8s tornando mais fácil gerenciar aplicações em ambientes K8s. Para realizar a instalação podemos seguir o orientado pela [documentação oficial](https://helm.sh/docs/intro/install/) baseado no seu sistema operacional ou executar o script abaixo que faz a analise e baixa a versão mais recente para o seu dispositivo:

```
 curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
 chmod 700 get_helm.sh
 ./get_helm.sh
```

# Criação de IAM Roles

Para permitir que um ambiente interaja com os recursos da AWS, é necessário criar uma IAM Role com o nível mínimo de acesso necessário e atribuí-la ao nosso controlador. Assim como em qualquer outro cenário, essa é uma etapa importante para garantir a segurança dos recursos da AWS. O AWS load balancer controller ja tem uma policy disponibilizada pela aws especialmente para que possamos criar a role, basta seguir o comando abaixo para realizar o download local:

```
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.4.4/docs/install/iam_policy.json
```

Feito o download, basta que executemos o seguinte comando utilizando o aws cli para criar a policy:

```
aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam_policy.json
```

Agora com policy criada, vamos começar a criação da IAM Role, para isso precisamos saber o ID do nosso OIDC e para descobrir basta executar o seguinte comando:

```
aws eks describe-cluster --name my-eks-lab-cluster --query "cluster.identity.oidc.issuer"  --output text | cut -d '/' -f 5
```

Primeiro, vamos criar uma Role adicionando uma relação de confiança através do trust relationships, para criar a função, a namespace que o alb irá executar é a  `kube-system` e a service account que terá permissão para acessar a função será `aws-load-balancer-controller`. Lembre-se de substituir, pelos dados da sua conta AWS e o id do OIDC obtido no passo anterior dai execute o seguinte comando para criar um arquivo JSON de política de confiança do IAM:

```
cat >load-balancer-role-trust-policy.json <<EOF
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
                    "oidc.eks.<AWS-REGION>.amazonaws.com/id/<OIDC-ID>:sub": "system:serviceaccount:kube-system:aws-load-balancer-controller"
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
  --role-name AmazonEKSLoadBalancerControllerRole \
  --assume-role-policy-document file://"load-balancer-role-trust-policy.json"
```

Com a função criada, vamos anexar a política que determinará quais permissões o controller poderá assumir, lembre-se de alterar o campo em destaque pelo id da sua conta AWS:

```
aws iam attach-role-policy \
  --policy-arn arn:aws:iam::<AWS-ACCOUNT>:policy/AWSLoadBalancerControllerIAMPolicy \
  --role-name AmazonEKSLoadBalancerControllerRole
```

# Instalação ALB Controller

O primeiro passo para seguirmos com a instalação é criarmos a `ServiceAccount`, rode o comando abaixo na sua máquina para criar o arquivo de manifesto, mais uma vez, lembra-se de alterar o <AWS-ACCOUNT> pelo id da sua conta:

```
cat >aws-load-balancer-controller-service-account.yaml <<EOF
apiVersion: v1
kind: ServiceAccount
metadata:
  labels:
    app.kubernetes.io/component: controller
    app.kubernetes.io/name: aws-load-balancer-controller
  name: aws-load-balancer-controller
  namespace: kube-system
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::<AWS-ACCOUNT>:role/AmazonEKSLoadBalancerControllerRole
EOF
```

Com a ServiceAccount criada agora teremos como de fato instalar o ALB controller utilizando o helm e construirmos o nosso primeiro ingress expondo o serviço para a internet, a instalação utilizando o helm é bem simples e basta que executemos o comando helm abaixo:

```
# Add Helm repo
helm repo add eks https://aws.github.io/eks-charts

# Install 
helm install aws-load-balancer-controller eks/aws-load-balancer-controller -n kube-system --set clusterName=my-eks-lab-cluster --set serviceAccount.create=false --set serviceAccount.name=aws-load-balancer-controller --set image.repository=602401143452.dkr.ecr.us-east-1.amazonaws.com/amazon/aws-load-balancer-controller
```

Pronto, com isso ja teremos o load balancer controller criado no cluster, podemos começar a testar e criar os recursos necessários para que os acessos ocorram sem maiores problemas. É necessário que criem um security group para a ALB, que permita o trafego HTTP/HTTPS e dentro do security group dos nodes permita o trafego vindo a partir desse SG, com isso em mente podemos substituir os valores e partir para criação do ingress através do template abaixo:

```
cat >sample-app-ingress.yaml <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}]'
    alb.ingress.kubernetes.io/backend-protocol: HTTP
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/healthcheck-interval-seconds: "5"
    alb.ingress.kubernetes.io/healthcheck-path: /
    alb.ingress.kubernetes.io/healthcheck-protocol: HTTP
    alb.ingress.kubernetes.io/healthcheck-timeout-seconds: "3"
    alb.ingress.kubernetes.io/healthy-threshold-count: "2"
    alb.ingress.kubernetes.io/load-balancer-attributes: idle_timeout.timeout_seconds=60
    alb.ingress.kubernetes.io/target-group-attributes: deregistration_delay.timeout_seconds=60
    alb.ingress.kubernetes.io/unhealthy-threshold-count: "2"
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/security-groups: <NOME-SG-ALB>
    alb.ingress.kubernetes.io/subnets: <LISTA-SUBNETS>
    alb.ingress.kubernetes.io/tags: env=test,app=eks-sample-linux-app
  labels:
    env: dev
    app: eks-sample-linux-app
  name: eks-sample-linux-app
  namespace: eks-sample-app
spec:
  rules:
  - http:
      paths:
      - backend:
          service:
            name: eks-sample-linux-service
            port:
              number: 80
        path: /*
        pathType: ImplementationSpecific
EOF
```

Dessa forma o ingress será criado, disparando então a criação do application load balancer que dentro do console AWS irá criar o target group apontando para o nosso pod. O processo pode ser acompanhado através do console da AWS.

Espero que tenham compreendido bem todo o processo de criação e disponibilização, deixarei o link da [documentação](https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.1/guide/ingress/annotations/) contento todos as annotations possíveis, assim vocês podem analisar outras abordagem como forçar redirecionamento para HTTPS, utilizar um certificado importado no ACM e entre outras.