---
image: /assets/img/AWS.png
title: Governanca de Tags na Nuvem Como Automatizar e Validar Padroes
description: Em ambientes de nuvem, a velocidade com que criamos recursos é ao
  mesmo tempo uma vantagem e um risco. É comum que, no meio da correria para
  atender uma demanda urgente, recursos sejam criados sem qualquer padrão de
  nomenclatura ou identificação.
date: 2026-02-21
category: devops
background: "#05A6F0"
status: draft
tags:
  - TAGS
  - NUVEM
  - CLOUD
  - DEVOPS
  - FINOPS
  - TERRAFORM
  - AWS
  - AWSCLI
  - AWSCONFIG
  - GOVERNANÇA
  - TAGGING
  - ORGANIZAÇÃO
  - INFRAASCODE
  - SECURITYASCODE
categories:
  - TAGS
  - NUVEM
  - CLOUD
  - DEVOPS
  - FINOPS
  - TERRAFORM
  - AWS
  - AWSCLI
  - AWSCONFIG
  - GOVERNANÇA
  - TAGGING
  - ORGANIZAÇÃO
  - INFRAASCODE
  - SECURITYASCODE
---
Sem um controle sobre **tags**, você perde visibilidade de quem criou o quê, qual projeto está consumindo recursos e, pior ainda, quais custos são realmente necessários. Isso abre a porta para desperdício financeiro, insegurança operacional e dores de cabeça em auditorias, vamos aprender:

* Por que **tags** são cruciais para governança.
* Como criar um **padrão replicável** de tags.
* Como aplicar automaticamente tags em todos os recursos usando **Terraform**.
* Como validar, via **AWS Config**, que todos os recursos estão em conformidade.

No final, você terá um ambiente que **se autorregula**, identificando rapidamente qualquer recurso fora do padrão.

### O papel das tags na governança em nuvem

Se você já tentou responder à pergunta **"Quanto custa esse projeto?"** ou **"Quem criou esse recurso?"** sem tags, sabe o quanto isso é difícil.

Tags são metadados aplicados a recursos cloud que servem para:

1. Controle de custos (FinOps)

   * Filtrar gastos por projeto, squad, centro de custo ou cliente.
   * Ajudar a justificar investimentos e cortes de orçamento.
2. Automação e operações

   * Rodar scripts ou pipelines apenas em recursos específicos.
   * Ex.: Encerrar instâncias “de laboratório” fora do horário comercial automaticamente.
3. Segurança e compliance

   * Garantir que recursos críticos estejam criptografados.
   * Validar que ambientes de produção têm backups habilitados.
4. Organização e troubleshooting

   * Localizar rapidamente recursos em ambientes grandes.
   * Criar relatórios ou dashboards segmentados.

Sem uma estratégia, cada equipe cria tags da própria forma:

* `Environment: Prod`, `environment: production`, `env: prod` — tudo significa a mesma coisa, mas para o sistema são chaves diferentes.

### Definindo um padrão de tags

Antes de sair aplicando regras, precisamos definir um **padrão claro e aceito** por todos.

| Tag           | Valores permitidos        | Obrigatória | Observações                 |
| ------------- | ------------------------- | ----------- | --------------------------- |
| `squad`       | cloud, sre, engenharia    | ✅           | Nome da equipe responsável  |
| `environment` | dev, hml, prd             | ✅           | Ambiente do recurso         |
| `cost-center` | core, business, marketing | ✅           | Centro de custo oficial     |
| `owner`       | e-mail corporativo        | ✅           | Pessoa ou grupo responsável |

**Boas práticas**:

* Sempre usar **letras minúsculas**.
* Não usar espaços nem caracteres especiais.
* Revisar a lista a cada 6 meses.

### Como vamos implementar

Vamos usar dois pilares:

1. **Automação com Terraform** → para garantir que os recursos já nasçam com as tags certas.
2. **Validação com AWS Config** → para garantir que, mesmo que alguém crie algo manualmente, ele será identificado se estiver fora do padrão.

## Hands-on: Criando e validando tags na AWS

### 1. Pré-requisitos

* Conta AWS com permissões para criar recursos, IAM roles e AWS Config.
* **Terraform** instalado ([download aqui](<>)).
* **AWS CLI** configurado (`aws configure`).

### 2. Estrutura Terraform: criando um bucket S3 com tags obrigatórias

**Arquivo `main.tf`**:

```
provider "aws" {
  region = "us-east-1"
}

variable "tags" {
  type = map(string)
  default = {
    squad        = "cloud"
    environment  = "dev"
    cost-center  = "core"
    owner        = "thiago.alexandria"
  }
}

resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "example" {
  bucket = "governanca-tags-exemplo-${random_id.suffix.hex}"
  tags   = var.tags
}
```

### 3. Criando a regra de compliance no AWS Config

**Arquivo `config.tf`**:

```
resource "aws_iam_role" "config_role" {
  name = "AWSConfigRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "config.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "config_policy" {
  role       = aws_iam_role.config_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSConfigRole"
}

resource "aws_s3_bucket" "config_logs" {
  bucket = "config-logs-${random_id.config_logs.hex}"
}

resource "random_id" "config_logs" {
  byte_length = 4
}

resource "aws_config_configuration_recorder" "recorder" {
  name     = "config-recorder"
  role_arn = aws_iam_role.config_role.arn
}

resource "aws_config_delivery_channel" "channel" {
  name           = "config-channel"
  s3_bucket_name = aws_s3_bucket.config_logs.bucket
  depends_on     = [aws_config_configuration_recorder.recorder]
}

resource "aws_config_config_rule" "required_tags" {
  name = "required-tags"
  source {
    owner             = "AWS"
    source_identifier = "REQUIRED_TAGS"
  }
  input_parameters = jsonencode({
    tag1Key = "squad"
    tag2Key = "environment"
    tag3Key = "cost-center"
    tag4Key = "owner"
  })
}
```

### 4. Executando o deploy

Isso cria o bucket S3 com as tags e ativa o AWS Config para monitorar.

```
terraform init
terraform apply -auto-approve
```

### 5. Testando a governança

Remova uma tag do bucket no console ou via CLI:

```
aws s3api delete-bucket-tagging --bucket <nome-do-bucket>
```

Aguarde alguns minutos e vá em **AWS Config → Rules → required-tags**, você verá o recurso marcado como **NON_COMPLIANT.**

### 6. Corrigindo

Adicione novamente as tags:

```
aws s3api put-bucket-tagging --bucket <nome-do-bucket> --tagging 'TagSet=[{Key=squad,Value=cloud},{Key=environment,Value=dev},{Key=cost-center,Value=core},{Key=owner,Value=thiago.alexandria'
```

Em alguns minutos, o status voltará para **COMPLIANT**.

## Modo avançado: validando valores de tags

A regra `REQUIRED_TAGS` valida apenas a existência das tags, não seus valores.\
Se você quiser validar valores específicos, precisará criar uma **Custom Config Rule** usando Lambda.

Exemplo de lógica em Python para validar `environment`:

```
if tag['Key'] == 'environment' and tag['Value'] not in ['dev', 'hml', 'prd']:
    non_compliant.append(resourceId)
```

Isso garante que ninguém crie, por exemplo, `Environment=Testinho`.

## Erros comuns

* **Não iniciar o Configuration Recorder** → sem ele, o AWS Config não funciona.
* **Demora para atualização** → avaliações podem levar até 15 minutos.
* **Valores inconsistentes** → padronize lowercase e listas controladas.

## Métricas e ROI: O impacto real da governança de tags

Implementar governança de tags não é apenas organização, é economia real e visibilidade operacional.

### Impacto financeiro

Organizações que implementam governança de tags reportam:

* **15-30% de redução nos custos de nuvem** através de identificação de recursos ociosos
* **Economia média de $50k-$500k/ano** dependendo do tamanho da operação
* **Tempo de análise de custos reduzido de dias para minutos**

### Benefícios operacionais

* **Tempo de troubleshooting**: Redução de 60% no tempo para localizar recursos
* **Auditorias**: De 2-3 semanas para 2-3 dias
* **Chargeback**: Relatórios automáticos por squad/projeto
* **Compliance**: Evidências prontas para SOC2, ISO27001

**ROI típico**: Para cada $1 investido em governança de tags, empresas economizam $8-15 em custos operacionais e desperdício evitado.

## Integração com CI/CD: Validação automática de tags

Vamos garantir que nenhum recurso sem tags chegue à produção.

### GitHub Actions

Crie `.github/workflows/tag-validation.yml`:

```yaml
name: Tag Validation

on:
  pull_request:
    paths:
      - 'terraform/**'
  push:
    branches: [ main ]

jobs:
  validate-tags:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2

      - name: Terraform Init
        run: terraform init
        working-directory: terraform

      - name: Validate Tags
        run: |
          # Extrai todos os recursos do plano
          terraform plan -out=tfplan
          terraform show -json tfplan > plan.json
          
          # Script Python para validar tags
          python3 << 'EOF'
          import json
          import sys

          required_tags = ['squad', 'environment', 'cost-center', 'owner']
          valid_environments = ['dev', 'hml', 'prd']
          
          with open('plan.json') as f:
              plan = json.load(f)
          
          errors = []
          
          for resource in plan.get('planned_values', {}).get('root_module', {}).get('resources', []):
              tags = resource.get('values', {}).get('tags', {})
              resource_address = resource.get('address', 'unknown')
              
              # Verifica tags obrigatórias
              missing_tags = [tag for tag in required_tags if tag not in tags]
              if missing_tags:
                  errors.append(f"{resource_address}: Missing tags {missing_tags}")
              
              # Valida valores
              if 'environment' in tags and tags['environment'] not in valid_environments:
                  errors.append(f"{resource_address}: Invalid environment '{tags['environment']}'. Must be one of {valid_environments}")
          
          if errors:
              print("\n".join(errors))
              sys.exit(1)
          else:
              print("All resources have valid tags!")
          EOF
        working-directory: terraform

      - name: Comment PR
        if: github.event_name == 'pull_request' && failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '## Tag Validation Failed\n\nSome resources are missing required tags or have invalid values. Check the workflow logs for details.'
            });
```

### GitLab CI

Crie `.gitlab-ci.yml`:

```yaml
stages:
  - validate
  - deploy

validate_tags:
  stage: validate
  image: hashicorp/terraform:latest
  script:
    - cd terraform
    - terraform init
    - terraform plan -out=tfplan
    - terraform show -json tfplan > plan.json
    - |
      apk add --no-cache python3 py3-pip
      pip3 install boto3
      python3 validate_tags.py
  artifacts:
    paths:
      - terraform/plan.json
    expire_in: 1 day
  only:
    - merge_requests
    - main

deploy:
  stage: deploy
  script:
    - terraform apply -auto-approve
  only:
    - main
  needs:
    - validate_tags
```

**Arquivo `validate_tags.py`**:

```python
import json
import sys

REQUIRED_TAGS = ['squad', 'environment', 'cost-center', 'owner']
VALID_ENVIRONMENTS = ['dev', 'hml', 'prd']
VALID_SQUADS = ['cloud', 'sre', 'engenharia', 'data']

def validate_tags(plan_file):
    with open(plan_file) as f:
        plan = json.load(f)
    
    errors = []
    warnings = []
    
    resources = plan.get('planned_values', {}).get('root_module', {}).get('resources', [])
    
    for resource in resources:
        tags = resource.get('values', {}).get('tags', {})
        address = resource.get('address', 'unknown')
        
        # Verifica tags obrigatórias
        missing = [tag for tag in REQUIRED_TAGS if tag not in tags]
        if missing:
            errors.append(f"{address}: Missing required tags: {', '.join(missing)}")
        
        # Valida environment
        if 'environment' in tags:
            if tags['environment'] not in VALID_ENVIRONMENTS:
                errors.append(f"{address}: Invalid environment '{tags['environment']}'")
        
        # Valida squad
        if 'squad' in tags:
            if tags['squad'] not in VALID_SQUADS:
                warnings.append(f"{address}: Unknown squad '{tags['squad']}'")
        
        # Valida formato do owner (email)
        if 'owner' in tags:
            if '@' not in tags['owner']:
                errors.append(f"{address}: Owner must be a valid email")
    
    # Imprime resultados
    if warnings:
        print("\n".join(warnings))
    
    if errors:
        print("\n".join(errors))
        sys.exit(1)
    else:
        print(f"All {len(resources)} resources have valid tags!")

if __name__ == '__main__':
    validate_tags('plan.json')
```

## Custom Config Rules: Validando valores de tags

A regra `REQUIRED_TAGS` valida apenas existência. Vamos criar uma Custom Rule para validar valores.

### Lambda Function para validação

**Arquivo `lambda_function.py`**:

```python
import boto3
import json

VALID_VALUES = {
    'environment': ['dev', 'hml', 'prd'],
    'squad': ['cloud', 'sre', 'engenharia', 'data'],
    'cost-center': ['core', 'business', 'marketing']
}

def evaluate_compliance(configuration_item):
    """Avalia se as tags estão em conformidade"""
    
    if configuration_item['resourceType'] not in ['AWS::S3::Bucket', 'AWS::EC2::Instance']:
        return 'NOT_APPLICABLE'
    
    tags = {tag['key']: tag['value'] for tag in configuration_item.get('tags', {})}
    
    # Verifica valores permitidos
    for tag_key, valid_values in VALID_VALUES.items():
        if tag_key in tags:
            if tags[tag_key] not in valid_values:
                return 'NON_COMPLIANT'
    
    return 'COMPLIANT'

def lambda_handler(event, context):
    """Handler principal da Lambda"""
    
    config = boto3.client('config')
    
    invoking_event = json.loads(event['invokingEvent'])
    configuration_item = invoking_event['configurationItem']
    
    compliance_status = evaluate_compliance(configuration_item)
    
    # Envia resultado para AWS Config
    config.put_evaluations(
        Evaluations=[{
            'ComplianceResourceType': configuration_item['resourceType'],
            'ComplianceResourceId': configuration_item['resourceId'],
            'ComplianceType': compliance_status,
            'OrderingTimestamp': configuration_item['configurationItemCaptureTime']
        }],
        ResultToken=event['resultToken']
    )
    
    return {'statusCode': 200}
```

### Terraform para criar a Custom Rule

**Arquivo `custom_config_rule.tf`**:

```terraform
resource "aws_iam_role" "lambda_config_role" {
  name = "lambda-config-tag-validation"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_config_policy" {
  role       = aws_iam_role.lambda_config_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSConfigRulesExecutionRole"
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "lambda_function.py"
  output_path = "lambda_function.zip"
}

resource "aws_lambda_function" "tag_validator" {
  filename         = "lambda_function.zip"
  function_name    = "config-tag-validator"
  role            = aws_iam_role.lambda_config_role.arn
  handler         = "lambda_function.lambda_handler"
  runtime         = "python3.11"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
}

resource "aws_lambda_permission" "allow_config" {
  statement_id  = "AllowExecutionFromConfig"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.tag_validator.function_name
  principal     = "config.amazonaws.com"
}

resource "aws_config_config_rule" "tag_values_validation" {
  name = "tag-values-validation"

  source {
    owner             = "CUSTOM_LAMBDA"
    source_identifier = aws_lambda_function.tag_validator.arn
    source_detail {
      message_type = "ConfigurationItemChangeNotification"
    }
  }

  depends_on = [aws_lambda_permission.allow_config]
}
```

## Auto-remediação: Corrigindo tags automaticamente

Vamos além da detecção e implementar correção automática.

### SSM Automation Document

**Arquivo `remediation.tf`**:

```terraform
resource "aws_ssm_document" "tag_remediation" {
  name          = "TagRemediation"
  document_type = "Automation"

  content = jsonencode({
    schemaVersion = "0.3"
    description   = "Adiciona tags obrigatórias em recursos não conformes"
    parameters = {
      ResourceId = {
        type        = "String"
        description = "ID do recurso"
      }
      ResourceType = {
        type        = "String"
        description = "Tipo do recurso"
      }
    }
    mainSteps = [{
      name   = "AddTags"
      action = "aws:executeScript"
      inputs = {
        Runtime = "python3.8"
        Handler = "add_tags"
        Script  = <<-EOT
          import boto3
          
          def add_tags(events, context):
              resource_id = events['ResourceId']
              resource_type = events['ResourceType']
              
              default_tags = {
                  'squad': 'unassigned',
                  'environment': 'unknown',
                  'cost-center': 'unassigned',
                  'owner': 'cloud-team@company.com'
              }
              
              if 'S3' in resource_type:
                  s3 = boto3.client('s3')
                  s3.put_bucket_tagging(
                      Bucket=resource_id,
                      Tagging={'TagSet': [{'Key': k, 'Value': v} for k, v in default_tags.items()]}
                  )
              elif 'EC2' in resource_type:
                  ec2 = boto3.client('ec2')
                  ec2.create_tags(
                      Resources=[resource_id],
                      Tags=[{'Key': k, 'Value': v} for k, v in default_tags.items()]
                  )
              
              return {'message': 'Tags added successfully'}
        EOT
        InputPayload = {
          ResourceId   = "{{ ResourceId }}"
          ResourceType = "{{ ResourceType }}"
        }
      }
    }]
  })
}

resource "aws_config_remediation_configuration" "tag_remediation" {
  config_rule_name = aws_config_config_rule.required_tags.name
  target_type      = "SSM_DOCUMENT"
  target_identifier = aws_ssm_document.tag_remediation.name
  automatic        = true
  maximum_automatic_attempts = 3
  retry_attempt_seconds      = 60

  parameter {
    name         = "ResourceId"
    static_value = "RESOURCE_ID"
  }

  parameter {
    name         = "ResourceType"
    static_value = "RESOURCE_TYPE"
  }
}
```

## Casos de uso avançados

### 1. Tag Policies com AWS Organizations

Para contas múltiplas, use Tag Policies:

```json
{
  "tags": {
    "environment": {
      "tag_key": {
        "@@assign": "environment"
      },
      "tag_value": {
        "@@assign": ["dev", "hml", "prd"]
      },
      "enforced_for": {
        "@@assign": ["ec2:instance", "s3:bucket", "rds:db"]
      }
    }
  }
}
```

### 2. Auto-tagging com EventBridge

Tagueie recursos automaticamente na criação:

```terraform
resource "aws_cloudwatch_event_rule" "resource_created" {
  name        = "auto-tag-resources"
  description = "Trigger when resources are created"

  event_pattern = jsonencode({
    source      = ["aws.ec2", "aws.s3"]
    detail-type = ["AWS API Call via CloudTrail"]
    detail = {
      eventName = ["RunInstances", "CreateBucket"]
    }
  })
}

resource "aws_cloudwatch_event_target" "lambda" {
  rule      = aws_cloudwatch_event_rule.resource_created.name
  target_id = "AutoTagLambda"
  arn       = aws_lambda_function.auto_tagger.arn
}
```

### 3. Relatório de recursos sem tags

```bash
#!/bin/bash
# Script para listar recursos sem tags obrigatórias

REQUIRED_TAGS=("squad" "environment" "cost-center" "owner")

echo "=== Recursos sem tags obrigatórias ==="

# S3 Buckets
for bucket in $(aws s3api list-buckets --query 'Buckets[].Name' --output text); do
    tags=$(aws s3api get-bucket-tagging --bucket $bucket 2>/dev/null | jq -r '.TagSet[].Key')
    
    for required in "${REQUIRED_TAGS[@]}"; do
        if ! echo "$tags" | grep -q "$required"; then
            echo "S3 Bucket: $bucket - Missing tag: $required"
        fi
    done
done

# EC2 Instances
aws ec2 describe-instances --query 'Reservations[].Instances[].[InstanceId,Tags]' --output json | \
jq -r '.[] | select(.[1] == null or (.[1] | map(.Key) | index("squad") == null)) | .[0]' | \
while read instance; do
    echo "EC2 Instance: $instance - Missing required tags"
done
```

**Lembre-se** a customização precisa ser feita para cada tipo de recurso que você utiliza! Não existe uma forma mágica de "Buscar todos os recursos sem tag" a operação consiste em analisar baseado em recursos, seja ec2, rds, ebs ...


### Para começar hoje:

1. **Defina seu padrão**: Reúna stakeholders e defina 4-6 tags obrigatórias
2. **Implemente no Terraform**: Use o código deste artigo como base
3. **Configure AWS Config**: Comece com REQUIRED_TAGS
4. **Valide no pipeline**: Adicione o script de validação no CI/CD
5. **Monitore**: Crie um dashboard simples de compliance


Governança de tags não é burocracia, é **inteligência operacional**.

Com tags bem implementadas, você transforma um ambiente caótico em um sistema organizado onde:

* **Custos são transparentes** e atribuíveis
* **Recursos órfãos são identificados** automaticamente
* **Auditorias são simples** e baseadas em dados
* **Times têm autonomia** dentro de guardrails claros

A diferença entre organizações que controlam seus custos de nuvem e aquelas que sofrem com surpresas na fatura está na disciplina de tagging.

Comece pequeno, com 4-5 tags essenciais. Automatize a validação. Expanda gradualmente.

O importante é dar o primeiro passo hoje. Seu CFO (e seu time de FinOps) vão agradecer.


### Recursos adicionais:

* [AWS Tagging Best Practices](https://docs.aws.amazon.com/general/latest/gr/aws_tagging.html)
* [AWS Config Rules Repository](https://github.com/awslabs/aws-config-rules)
* [FinOps Foundation - Tagging Standards](https://www.finops.org/framework/capabilities/tagging-labeling/)
* [Terraform AWS Provider - Tags](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/guides/resource-tagging)
* [r/aws no Reddit](https://reddit.com/r/aws)
* [FinOps Slack Community](https://finops.org/community/)
* [AWS re:Post - Tagging](https://repost.aws/tags/TA4IvCeWI1R1-J7H9z8LZvuA/tagging)
