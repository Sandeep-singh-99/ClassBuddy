import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export default function AssignmentForm() {
  return (
    <Dialog>
        <DialogTrigger asChild>
            <Button variant="secondary">Create Assignment</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <form className="space-y-4">
                <DialogHeader>
                    <DialogTitle>
                        Assignment
                    </DialogTitle>
                    <DialogDescription>
                        Enter the assignment details below and click create when you're ready.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="title">Assignment Title</Label>
                        <Input id="title" name="title" type="text" className="input" />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="description">Assignment Description</Label>
                        <Input id="description" name="description" type="text" className="input" />
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input id="dueDate" name="dueDate" type="date" className="input" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" type="button">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  )
}
