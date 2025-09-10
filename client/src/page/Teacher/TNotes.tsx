import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";


export default function TNotes() {
  return (
    <div className="max-w-4xl mx-auto p-6">
        <Card>
            <CardHeader>
                <CardTitle>Create New Notes</CardTitle>
            </CardHeader>

            <CardContent>
                <form>
                    <Textarea placeholder="Provide a title or topic, and our AI will create detailed notes." />
                    <Button type="submit" className="mt-4">
                     Create Notes
                    </Button>
                </form>
            </CardContent>
        </Card>
    </div>
  )
}
