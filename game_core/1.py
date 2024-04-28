import socket

class MeshServer:
    def __init__(self):
        self.host = '0.0.0.0'  # Listen on all available interfaces
        self.port = 9999
        self.connected_clients = {}  # Dictionary to store connected clients and their sockets

    def start(self):
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind((self.host, self.port))
        server_socket.listen(5)

        print(f"[*] Listening on {self.host}:{self.port}")

        while True:
            client_socket, address = server_socket.accept()
            print(f"[*] Accepted connection from: {address}")
            self.connected_clients[address] = client_socket
            self.handle_client(address)

    def handle_client(self, address):
        while True:
            try:
                data = self.connected_clients[address].recv(1024)
                if not data:
                    break
                print(f"Received message from {address}: {data.decode()}")
                # Handle the received message here, e.g., check if it's a private message
                self.handle_message(data, address)
            except ConnectionResetError:
                print(f"[*] Client {address} disconnected")
                self.connected_clients[address].close()
                del self.connected_clients[address]
                break

    def handle_message(self, message, sender_address):
        # Check if the message is a private message
        if message.startswith(b'PRIVATE'):
            parts = message.split(b' ', 2)
            if len(parts) >= 3:
                target_address = eval(parts[1].decode())
                if target_address in self.connected_clients:
                    target_socket = self.connected_clients[target_address]
                    target_socket.send(parts[2])
                    print(f"Sent private message to {target_address}")
                else:
                    print(f"Error: Target address {target_address} not found")
        else:
            # Handle other types of messages (e.g., broadcast)
            # Here you can implement different message handling logic as needed
            pass

if __name__ == "__main__":
    server = MeshServer()
    server.start()
