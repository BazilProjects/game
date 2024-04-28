import socket

def main():
    host = '127.0.0.1'  # Server IP address
    port = 9999

    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    client_socket.connect((host, port))

    while True:
        message = input("Enter message to send (or type 'quit' to exit): ")
        if message.lower() == 'quit':
            break
        elif message.startswith('PRIVATE'):
            # Extract target address and message content from input
            parts = message.split(' ', 2)
            if len(parts) >= 3:
                target_address = eval(parts[1])
                private_message = parts[2]
                # Format the message as 'PRIVATE target_address message_content'
                message = f'PRIVATE {target_address} {private_message}'
        client_socket.send(message.encode())

    client_socket.close()

if __name__ == "__main__":
    main()
