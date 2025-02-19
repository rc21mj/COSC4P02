import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import TextField from '@mui/material/TextField'

function SupportForm() {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <CardContent>
          <h2 className="text-2xl font-bold text-center mb-4">Contact Support</h2>
          <form 
            action="https://formsubmit.co/7d16a2e7eae6e29c1d16d5066c1fe39c" 
            method="POST" 
            className="space-y-4"
          >
            <div>
              <Input type="text" name="Topic" placeholder="Your Topic" required />
            </div>
            <div>
              <Input type="email" name="Email" placeholder="Your Email" required />
            </div>
            <div>
              <TextField name="Message" placeholder="Your Message" required />
            </div>
            <Button type="submit" className="w-full">Send Message</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
export default SupportForm;