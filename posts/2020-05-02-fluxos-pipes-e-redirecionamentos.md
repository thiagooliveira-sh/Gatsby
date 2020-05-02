---
image: /assets/img/bash.png
title: 'Fluxos, Pipes e Redirecionamentos'
description: >-
  Entender melhor os comandos antes de utiliza-los é muito importante, então
  segue alguns dos mais comuns quando falamos em redirecionamentos e fluxos..
date: '2020-05-02'
category: linux
background: '#EE0000'
tags:
  - Fluxos
  - Pipes
  - Redirecionamentos
categories:
  - Linux
---
É muito comum precisarmos utilizar de artifícios para redirecionamento e mudança de fluxos no linux, principalmente quando queremos armazenar informações referente a erros e saídas de outros comandos, além de combinar outros comandos para obter um resultado.

Temos redirecionamentos para entrada, saída e erro, para alterar a saída padrão utilizamos o "`>`" se a saída existir, ele é sobrescrito, caso não exista será criado.

```
thiago@THIAGO-PC:~/Exemplos$ ls 
	exemplo.tar.gz   teste		
thiago@THIAGO-PC:~/Exemplos$ ls > saida_ls
		
thiago@THIAGO-PC:~/Exemplos$ cat saida_ls 
	exemplo.tar.gz   teste
```

Outra forma para alterarmos a saída padrão é utilizando o "`>>`" para esse caso se a saída existir ele insere o resultado no final do arquivo, caso não exista será criado.

```
thiago@THIAGO-PC:~/Exemplos$ ls >> saida_ls
		
thiago@THIAGO-PC:~/Exemplos$ cat saida_ls2 
	exemplo.tar.gz   teste  teste.txt
```

Para o redirecionamento de erro ou Std_Error irá redirecionar a saída de erro para o local desejado, para o redirecionamento de erro é utilizando o "`2>`":

```
thiago@THIAGO-PC:~$ ls /tmp/arquivo
ls: não é possível acessar '/tmp/arquivo': Arquivo ou diretório não encontrado
thiago@THIAGO-PC:~$ ls /tmp/arquivo 2> erro.log

thiago@THIAGO-PC:~$ cat erro.log 
ls: não é possível acessar '/tmp/arquivo': Arquivo ou diretório não encontrado
```

Assim como para a saída padrão, existe também uma forma incremental para a o Std_Error, utilizando o "`2>>`":

```
thiago@THIAGO-PC:~$ ls /tmp/arquivo2 2>>erro.log 
thiago@THIAGO-PC:~$ cat erro.log 
ls: não é possível acessar '/tmp/arquivo': Arquivo ou diretório não encontrado
ls: não é possível acessar '/tmp/arquivo2': Arquivo ou diretório não encontrado
```

Podemos combinar esse tipo de fluxo em scripts e direcionar o log de execução para um arquivo enquanto o log de erro irá para outro, por exemplo:

```
thiago@THIAGO-PC:~/Exemplos$ ls -l {Teste,Teste2}3 > saida.log 2> erro.log
thiago@THIAGO-PC:~/Exemplos$ cat saida.log 
-rw-rw-r-- 1 thiago thiago 0 Jun 18 16:19 Teste
thiago@THIAGO-PC:~/Exemplos$ cat erro.log 
ls: não é possível acessar 'Teste2': Arquivo ou diretório não encontrado
```

Assim como para saída e erro, podemos aplicar o redirecionamento também para entrada, a entrada padrão é o lugar de onde o programa recebe informações, nesse caso podemos repassar um arquivo para execução de um comando utilizando o "`<`":

```
thiago@THIAGO-PC:~/Exercicios$  tr 'a-z' 'A-z' < teste.txt 
THIAGO ALEXANDRIA
```

Outros comandos também realizam redirecionamentos e mudam o fluxo com que o resultado será retornado, para isso utilizamos bastante o pipe "`|`", com ele é possível utilizar a saída de um comando como entrada para outro, um ótimo exemplo para isso é o comando `xargs` e `awk` que iremos ver a seguir.

O `xargs` é usado ​​para construir e executar comandos a partir da entrada padrão. Converte entrada da entrada padrão em argumentos para um comando:

```
thiago@THIAGO-PC:~/Exemplos$ find /home/thiago/ -name "Teste"
/home/thiago/Exemplos/Teste.txt
/home/thiago/Exemplos/Teste2.txt

thiago@THIAGO-PC:~/Exemplos$ find /home/thiago/ iname teste | xargs rm -rvf
removed '/home/thiago/Exemplos/Teste/Teste.txt' 
removed '/home/thiago/Exemplos/Teste/Teste2.txt' 
```

o `awk` por sua vez modifica a saída padrão, por exemplo, queremos que seja retornado apenas o PID do processo que esta executando a screen da sessão:

```
thiago@THIAGO-PC:~/Exemplo$ ps faux | grep SCREEN | grep -v grep | awk '{print $2}'
358                        
```

Outros redirecionadores "`<<`" e "`<<<`", o "`<<`" é usado quando você deseja inserir um conteúdo interativamente, até que informe seu fim. Por exemplo:

```
thiago@THIAGO-PC:~/Exemplo$ tr a-z A-Z << final
Teste
conteudo
interativo
final
TESTE
CONTEUDO
INTERATIVO
```

Veja que a string "final" (pode ser qualquer string) vai informar ao shell que a entrada termina naquele ponto, e então ele irá enviar essa entrada ao comando tr.

O outro redirecionador, `<<<`, que é chamado de "here string". Ele simplesmente redireciona o que o segue como se fosse o conteúdo de um arquivo texto. Por exemplo:

```
thiago@THIAGO-PC:~/Exemplo$ tr a-z A-Z < teste.txt 
bash: teste.txt: Arquivo ou diretório não encontrado
 
thiago@THIAGO-PC:~/Exemplo$ tr a-z A-Z <<< teste.txt 
TESTE.TXT
```

Espero que tenham gostado do conteúdo abordado, nas próximas postagens, vamos abordar **"Criar, Monitorar e Encerrar Processos".**
