from locust import HttpUser, task, between

class JobSearchUser(HttpUser):
    wait_time = between(1, 5)

    @task(3)
    def search_python_jobs(self):
        self.client.get("/api/v1/jobs/search?query=Python&location=Remote")

    @task(1)
    def search_random_jobs(self):
        self.client.get("/api/v1/jobs/search?query=Manager&location=New+York")

    @task(1)
    def health_check(self):
        self.client.get("/")
