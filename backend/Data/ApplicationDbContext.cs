using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Listing> Listings { get; set; }
    public DbSet<Ownership> Ownerships { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Email için unique index
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Phone için unique index (opsiyonel, telefon numarası unique olmasını istiyorsanız)
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Phone)
            .IsUnique();

        // Listing - User ilişkisi
        modelBuilder.Entity<Listing>()
            .HasOne(l => l.User)
            .WithMany()
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Ownership - Listing ilişkisi
        modelBuilder.Entity<Ownership>()
            .HasOne(o => o.Listing)
            .WithMany()
            .HasForeignKey(o => o.ListingId)
            .OnDelete(DeleteBehavior.Restrict); // İlan silinirse sahiplik kaydı kalır (tarih için)

        // Ownership - Owner (User) ilişkisi
        modelBuilder.Entity<Ownership>()
            .HasOne(o => o.Owner)
            .WithMany()
            .HasForeignKey(o => o.OwnerId)
            .OnDelete(DeleteBehavior.Restrict); // Kullanıcı silinirse sahiplik kaydı kalır

        // QR Code ID için unique index
        modelBuilder.Entity<Ownership>()
            .HasIndex(o => o.QrCodeId)
            .IsUnique();
    }
}

