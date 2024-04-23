(define make_matrix (lambda (f_row s_col)
                      (make-list f_row (make-list s_col 0))
                      )
  )

(define multiply_matrix (lambda (f_m s_m)
                          (define i 0)
                          (define j 0)
                          (define k 0)
                          (define f_row (length f_m))
                          (define f_col (length (vector-ref f_m 0)))
                          (define s_row (length s_m))
                          (define s_col (length (vector-ref s_m 0)))
                          (
                            if (not (= s_row f_col))
                            "not possible"
                            (begin
                              (define multiply_matrix_rec (lambda (f_row f_col A s_row s_col B C)
                                                            (
                                                              if (< i f_row)
                                                              (begin
                                                                (
                                                                  if (< j s_col)
                                                                  (begin
                                                                    (
                                                                      if (< k f_col)
                                                                      (begin
                                                                        (define temp (+ (vector-ref (vector-ref C i) j) (* (vector-ref (vector-ref A i) k) (vector-ref (vector-ref B k) j))))
                                                                        (vector-set! (vector-ref C i) j temp)
                                                                        (set! k (+ k 1))
                                                                        (multiply_matrix_rec f_row f_col A s_row s_col B C)
                                                                        )
                                                                      0
                                                                      )
                                                                    (set! k 0)
                                                                    (set! j (+ j 1))
                                                                    (multiply_matrix_rec f_row f_col A s_row s_col B C)
                                                                    )
                                                                  0
                                                                  )
                                                                (set! j 0)
                                                                (set! i (+ i 1))
                                                                (multiply_matrix_rec f_row f_col A s_row s_col B C)
                                                                )
                                                              (return C)
                                                              )
                                                            )
                                )
                              (define result_matrix (make_matrix f_row s_col))
                              (return (multiply_matrix_rec f_row f_col f_m s_row s_col s_m result_matrix))
                              )
                            )
                          )
  )


;(define first_matrix '((1 2 3) (4 5 6) (7 8 9)))
;(define second_matrix '((1 2 3) (4 5 6) (7 8 9)))

;(displayln (multiply_matrix first_matrix second_matrix))
