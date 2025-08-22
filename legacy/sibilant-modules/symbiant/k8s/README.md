## To deploy: 

```sh
kubectl apply -f minecraft-deploy.yaml
kubectl apply -f minecraft-pv-sc.yaml
```

## Find `EXTERNAL-ip`

```sh
kubectl get svc
```

## Get Logs 

```sh
kubectl logs $( kubectl get pods | grep symbiant | awk '{print $1}' )
```
