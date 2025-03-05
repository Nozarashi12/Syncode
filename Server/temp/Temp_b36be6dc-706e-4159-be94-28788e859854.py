class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class LinkedList:
    def __init__(self):
        self.head = None

    def insert_at_beginning(self, data):
        new_node = Node(data)
        new_node.next = self.head  
        self.head = new_node  

    def display(self):
        temp = self.head
        while temp:
            print(temp.data, end=" ")
            temp = temp.next
        print()

# Taking user input
ll = LinkedList()
n = int(input())
for _ in range(n):
    ll.insert_at_beginning(int(input()))

print()
ll.display()
