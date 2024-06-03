import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"


@Entity()
export default class Product {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    image!: string;
    
    @Column({default: 0 })
    likes!: number;
}