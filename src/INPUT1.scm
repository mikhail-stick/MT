(define i 0)
(define j 0)
(define k 0)

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
                                C
                                )
                              )
  )

(define multiply_matrix (lambda (f_row f_col f_m s_row s_col s_m)
                          (
                            if (not (= s_row f_col))
                            "not possible"
                            (multiply_matrix_rec f_row f_col f_m s_row s_col s_m (quote ((quote (0 0 0)) (quote (0 0 0)) (quote (0 0 0)))))
                            )
                          )
  )

(define first_matrix (quote ((quote (1 2 3))
                              (quote (4 5 6))
                              (quote (7 8 9)))))
(define second_matrix (quote ((quote (1 2 3))
                               (quote (4 5 6))
                               (quote (7 8 9)))))


;(vector-set! (vector-ref first_matrix 0) 0 35)
;(display first_matrix)
(displayln (multiply_matrix 3 3 first_matrix 3 3 second_matrix))

;(display x)

(import "./INPUT2.scm")

(displayln x)
