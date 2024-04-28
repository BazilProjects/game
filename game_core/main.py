import pygame
import random

# Define constants
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
ROBOT_SIZE = 20
OBSTACLE_SIZE = 40
DESTINATION_SIZE = 30

# Define Robot class
class Robot(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface([ROBOT_SIZE, ROBOT_SIZE])
        self.image.fill(RED)
        self.rect = self.image.get_rect()
        self.rect.center = (SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2)
        self.destination = None
    
    def update(self, obstacles):
        # Navigate to destination if set
        if self.destination:
            dx = self.destination[0] - self.rect.centerx
            dy = self.destination[1] - self.rect.centery
            dist = (dx ** 2 + dy ** 2) ** 0.5
            if dist > 1:
                self.rect.x += int(dx / dist)
                self.rect.y += int(dy / dist)
            else:
                self.destination = None
            return
        
        # Simple avoidance behavior
        for obstacle in obstacles:
            if pygame.sprite.collide_rect(self, obstacle):
                # If colliding with an obstacle, move away from it
                if self.rect.centerx < obstacle.rect.centerx:
                    self.rect.x -= 1
                else:
                    self.rect.x += 1
                if self.rect.centery < obstacle.rect.centery:
                    self.rect.y -= 1
                else:
                    self.rect.y += 1
                return

        # If no obstacle, move randomly
        dx = random.randint(-1, 1)
        dy = random.randint(-1, 1)
        self.rect.x += dx
        self.rect.y += dy

# Define Obstacle class
class Obstacle(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface([OBSTACLE_SIZE, OBSTACLE_SIZE])
        self.image.fill(BLACK)
        self.rect = self.image.get_rect()
        self.rect.center = (x, y)

# Define Destination class
class Destination(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface([DESTINATION_SIZE, DESTINATION_SIZE])
        self.image.fill(WHITE)
        self.rect = self.image.get_rect()
        self.rect.center = (x, y)

# Main function
def main():
    pygame.init()
    screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
    pygame.display.set_caption("Visual Navigation")
    clock = pygame.time.Clock()

    # Create sprites
    robot = Robot()
    all_sprites = pygame.sprite.Group()
    all_sprites.add(robot)

    obstacles = pygame.sprite.Group()
    for _ in range(10):
        x = random.randint(0, SCREEN_WIDTH)
        y = random.randint(0, SCREEN_HEIGHT)
        obstacle = Obstacle(x, y)
        obstacles.add(obstacle)
        all_sprites.add(obstacle)

    destination = Destination(SCREEN_WIDTH - 50, SCREEN_HEIGHT - 50)
    all_sprites.add(destination)
    robot.destination = (destination.rect.centerx, destination.rect.centery)

    # Main loop
    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        # Update robot position
        robot.update(obstacles)

        screen.fill(WHITE)
        all_sprites.draw(screen)

        pygame.display.flip()
        clock.tick(60)

    pygame.quit()

if __name__ == "__main__":
    main()
