import { Button } from "@/components/ui/button";


export default function DeleteBtn({ noteId }: { noteId: string }) {

  return (
    <div>
        <Button variant={"ghost"} size={"sm"} >
        Delete
      </Button>
    </div>
  )
}
