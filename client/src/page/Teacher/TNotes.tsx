import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";


export default function TNotes() {
    const [visible, setVisible] = useState(false);
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

        {
            visible && (
                <div className="mt-6">
                    <Card>
                        <CardContent>
                            <form>
                                <div>
                                    <Label>
                                        Title
                                    </Label>

                                    <Input placeholder="Set the title of the notes..." className="mt-2 mb-4" />
                                </div>

                                <Button>
                                    Save Notes
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )
        }
    </div>
  )
}
