aws cloudformation create-stack \
 --stack-name moneyConverter \
 --template-body file://17DEC.yaml \
 --parameters file://parameter.json \
 --capabilities CAPABILITY_IAM \
 --region ap-southeast-1 \
 --output json
 --tags Key=Project,Value=moneyConvert Key=Environment,Value=Prod

 aws cloudformation create-stack `
  --stack-name moneyConverter `
  --template-body file://17DEC.yaml `
  --parameters file://parameter.json `
  --capabilities CAPABILITY_IAM `
  --region ap-southeast-1 `
  --output json `
  --tags Key=Project,Value=moneyConverter Key=Environment,Value=Prod
