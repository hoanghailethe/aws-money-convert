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
  --region eu-central-1 `
  --output json `
  --tags Key=Project,Value=moneyConverter Key=Environment,Value=Prod

aws cloudformation update-stack --stack-name YourStackName --template-body file://path/to/your/updated/template.yaml --parameters ParameterKey=ParamName,ParameterValue=ParamValue
aws cloudformation update-stack --stack-name moneyConverter --template-body file://21DEC.yaml --parameters file://parameter.json --region eu-central-1 --capabilities CAPABILITY_IAM

aws lambda invoke --function-name YourFunctionName --payload '{}' output.txt

aws lambda invoke --function-name ConvertCurrencyFunction --payload '{}' output.txt --region eu-central-1
aws lambda invoke --function-name DailyUpdateFunction --payload '{}' output.txt --region eu-central-1