n=int(input())
arr=list(map(int,input().split()))
target=int(input())

closeness=float('inf')
a=b=c=0

for i in range(n):
    for j in range(i+1,n):
        for k in range(j+1,n):
            cursum=arr[i]+arr[j]+arr[k]
            if abs(cursum-target)>closeness:
                closeness = abs(cursum - target)
                a, b, c = arr[i], arr[j], arr[k]

print(closeness)
