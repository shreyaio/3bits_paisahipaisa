import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Layout from "@/components/layout/Layout";
import StarRating from "@/components/shared/StarRating";
import VerificationBadge from "@/components/shared/VerificationBadge";
import { useListings } from "@/contexts/ListingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBookings } from "@/contexts/BookingContext";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Calendar as CalendarIcon, Clock, MessageCircle, Share, Heart, AlertTriangle, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Review {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const ItemDetails = () => {
  const params = useParams();
  const { listings } = useListings();
  const { user } = useAuth();
  const { bookings, addBooking } = useBookings();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([
    { userId: "user1", userName: "Alex Johnson", rating: 5, comment: "Great experience! The item was exactly as described and the owner was very responsive.", createdAt: new Date().toISOString() },
    { userId: "user2", userName: "Samantha Lee", rating: 4, comment: "Item was in good condition. Pickup and return were smooth. Would definitely rent again.", createdAt: new Date().toISOString() },
    { userId: "user3", userName: "Ravi Patel", rating: 5, comment: "Excellent service. The rental process was easy and the item worked perfectly!", createdAt: new Date().toISOString() },
  ]);

  const listing = listings.find(item => item.id === params.id);

  if (!listing) {
    return (
      <Layout>
        <div className="container mx-auto py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
            <p className="mb-6">The item you're looking for doesn't exist or has been removed.</p>
            <Link to="/browse">
              <Button>Browse Other Items</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const totalDays = calculateTotalDays();
  const totalPrice = totalDays * listing.pricePerDay;

  const handleBooking = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to book this item.",
        variant: "destructive",
      });
      return;
    }

    if (!startDate || !endDate) {
      toast({
        title: "Dates required",
        description: "Please select start and end dates for your booking.",
        variant: "destructive",
      });
      return;
    }

    if (listing.ownerId === user.id) {
      toast({
        title: "Cannot book your own item",
        description: "You cannot book an item that you've listed.",
        variant: "destructive",
      });
      return;
    }

    const newBooking = {
      id: Math.random().toString(36).substring(2, 9),
      listingId: listing.id,
      itemName: listing.title,
      itemImage: listing.images[0],
      ownerId: listing.ownerId,
      ownerName: user?.id === listing.ownerId ? user.name : "Unknown Owner",
      renterId: user.id,
      renterName: user.name,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      totalPrice,
      status: "pending" as "pending",
      createdAt: new Date().toISOString(),
    };

    addBooking(newBooking);

    toast({
      title: "Booking request sent",
      description: "The owner will be notified of your request.",
    });
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);

    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted
        ? "This item has been removed from your wishlist."
        : "This item has been added to your wishlist.",
    });
  };

  const handleAddReviewClick = () => {
    setIsAddingReview(true);
  };

  const handleCancelReview = () => {
    setIsAddingReview(false);
    setReviewRating(null);
    setReviewComment("");
  };

  const handleStarClick = (rating: number) => {
    setReviewRating(rating);
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewComment(event.target.value);
  };

  const handleSubmitReview = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to leave a review.",
        variant: "destructive",
      });
      return;
    }

    if (!reviewRating) {
      toast({
        title: "Rating required",
        description: "Please select a star rating.",
        variant: "destructive",
      });
      return;
    }

    if (!reviewComment.trim()) {
      toast({
        title: "Comment required",
        description: "Please write a comment for your review.",
        variant: "destructive",
      });
      return;
    }

    const newReview: Review = {
      userId: user.id,
      userName: user.name,
      rating: reviewRating,
      comment: reviewComment,
      createdAt: new Date().toISOString(),
    };

    setReviews([newReview, ...reviews]);
    setIsAddingReview(false);
    setReviewRating(null);
    setReviewComment("");
    toast({
      title: "Review submitted",
      description: "Thank you for your feedback!",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
              <div className="h-[400px] bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center text-amber-500">
                  <StarRating rating={listing.rating} />
                  <span className="ml-2 text-sm text-gray-500">
                    ({listing.reviews.length} reviews)
                  </span>
                </div>

                <div className="flex items-center text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{listing.location.toString()}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-b mb-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Price Per Day</div>
                  <div className="text-2xl font-bold">${listing.pricePerDay}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Condition</div>
                  <div className="font-medium">{listing.condition}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Category</div>
                  <div className="font-medium">{listing.category}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Rental Period</div>
                  <div className="font-medium">
                    {listing.minRentalDays} - {listing.maxRentalDays} days
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className={`${isWishlisted ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
                  onClick={toggleWishlist}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  {isWishlisted ? 'Saved' : 'Save'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    const shareData = {
                      title: listing.title,
                      text: `Check out this item: ${listing.title}`,
                      url: window.location.href,
                    };

                    if (navigator.share) {
                      navigator.share(shareData).catch((error) => {
                        console.error("Error sharing:", error);
                      });
                    } else {
                      toast({
                        title: "Sharing not supported",
                        description: "Your browser does not support the Web Share API.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>

                <Button variant="outline" className="text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Lender Information</h2>
                {listing.ownerId !== user?.id && (
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <span className="text-xl text-gray-500">{listing.ownerId.charAt(0)}</span>
                </div>

                <div>
                  <div className="font-medium flex items-center">
                    {listing.ownerId === user?.id ? user.name : "Unknown Owner"}
                    <VerificationBadge verified={true} status="verified" className="ml-2" />
                  </div>
                  <div className="text-sm text-gray-500">Member since {new Date().getFullYear()}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-6">Reviews & Ratings</h2>

              {isAddingReview ? (
                <div className="space-y-4">
                  <div className="flex items-center mb-2">
                    <label className="block text-sm font-medium mr-4">Rate this item:</label>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 cursor-pointer ${
                            star <= (reviewRating || 0) ? 'fill-amber-500 text-amber-500' : 'text-gray-400'
                          }`}
                          onClick={() => handleStarClick(star)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <Textarea
                      placeholder="Write your review here..."
                      value={reviewComment}
                      onChange={handleCommentChange}
                      className="w-full mb-2"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleCancelReview}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitReview} disabled={!reviewRating || !reviewComment.trim()}>
                      Submit Review
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <Button variant="outline" onClick={handleAddReviewClick} disabled={!user}>
                    Add Your Review
                  </Button>
                  {!user && <p className="text-xs text-gray-500 mt-1">Login to add a review.</p>}
                </div>
              )}
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.createdAt} className="border-b pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{review.userName}</div>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Book This Item</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Select Dates</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm">${listing.pricePerDay} × {totalDays} days</div>
                  <div>${totalPrice}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">Service fee</div>
                  <div>$0</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">Deposit Fee</div>
                  <div>${listing.depositFee}</div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center font-semibold">
                    <div>Total</div>
                    <div>${totalPrice + listing.depositFee}</div>
                  </div>
                </div>
              </div>
              <Button onClick={handleBooking} className="w-full">
                Request to Book
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ItemDetails;